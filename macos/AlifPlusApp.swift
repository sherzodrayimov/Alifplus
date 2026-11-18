import Cocoa
import Carbon.HIToolbox
import ApplicationServices

final class AlifSettings {
    static let shared = AlifSettings()
    private let defaults = UserDefaults.standard

    var isEnabled: Bool {
        didSet { NotificationCenter.default.post(name: .alifStateChanged, object: nil) }
    }
    var ruleO: Bool {
        get { defaults.object(forKey: "ruleO") as? Bool ?? true }
        set { defaults.set(newValue, forKey: "ruleO") }
    }
    var ruleG: Bool {
        get { defaults.object(forKey: "ruleG") as? Bool ?? true }
        set { defaults.set(newValue, forKey: "ruleG") }
    }
    var ruleSh: Bool {
        get { defaults.object(forKey: "ruleSh") as? Bool ?? true }
        set { defaults.set(newValue, forKey: "ruleSh") }
    }
    var ruleCh: Bool {
        get { defaults.object(forKey: "ruleCh") as? Bool ?? true }
        set { defaults.set(newValue, forKey: "ruleCh") }
    }
    var ruleNg: Bool {
        get { defaults.object(forKey: "ruleNg") as? Bool ?? false }
        set { defaults.set(newValue, forKey: "ruleNg") }
    }
    var instantUndo: Bool {
        get { defaults.object(forKey: "instantUndo") as? Bool ?? true }
        set { defaults.set(newValue, forKey: "instantUndo") }
    }

    private init() {
        self.isEnabled = true
    }
}

extension Notification.Name {
    static let alifStateChanged = Notification.Name("alifStateChanged")
}

final class KeyboardEngine {
    static let shared = KeyboardEngine()

    private var eventTap: CFMachPort?
    private var runLoopSource: CFRunLoopSource?
    private var permissionTimer: Timer?

    private var prevChar: Character? = nil
    private var lastReplacement: (inserted: String, original: String)? = nil

    private var ctrlShiftChordActive = false
    private var otherKeyPressedDuringChord = false

    private let syntheticTag: Int64 = 0x414C4946

    func start() {
        if checkAccessibility(prompt: true) {
            installTap()
        } else {
            permissionTimer?.invalidate()
            permissionTimer = Timer.scheduledTimer(withTimeInterval: 1.5, repeats: true) { [weak self] timer in
                guard let self = self else { return }
                if self.checkAccessibility(prompt: false) {
                    timer.invalidate()
                    self.permissionTimer = nil
                    self.installTap()
                }
            }
        }
    }

    func checkAccessibility(prompt: Bool) -> Bool {
        let options = [kAXTrustedCheckOptionPrompt.takeUnretainedValue() as String: prompt] as CFDictionary
        return AXIsProcessTrustedWithOptions(options)
    }

    private func installTap() {
        guard eventTap == nil else { return }

        let mask = (1 << CGEventType.keyDown.rawValue) |
                   (1 << CGEventType.flagsChanged.rawValue) |
                   (1 << CGEventType.leftMouseDown.rawValue) |
                   (1 << CGEventType.rightMouseDown.rawValue)

        let callback: CGEventTapCallBack = { proxy, type, event, refcon in
            guard let refcon = refcon else { return Unmanaged.passUnretained(event) }
            let engine = Unmanaged<KeyboardEngine>.fromOpaque(refcon).takeUnretainedValue()
            return engine.handleEvent(proxy: proxy, type: type, event: event)
        }

        guard let tap = CGEvent.tapCreate(
            tap: .cgSessionEventTap,
            place: .headInsertEventTap,
            options: .defaultTap,
            eventsOfInterest: CGEventMask(mask),
            callback: callback,
            userInfo: Unmanaged.passUnretained(self).toOpaque()
        ) else {
            return
        }

        eventTap = tap
        runLoopSource = CFMachPortCreateRunLoopSource(kCFAllocatorDefault, tap, 0)
        if let source = runLoopSource {
            CFRunLoopAddSource(CFRunLoopGetCurrent(), source, .commonModes)
        }
        CGEvent.tapEnable(tap: tap, enable: true)
    }

    private func resetBuffer() {
        prevChar = nil
        lastReplacement = nil
    }

    private func handleEvent(proxy: CGEventTapProxy, type: CGEventType, event: CGEvent) -> Unmanaged<CGEvent>? {
        if type == .tapDisabledByTimeout || type == .tapDisabledByUserInput {
            if let tap = eventTap {
                CGEvent.tapEnable(tap: tap, enable: true)
            }
            return Unmanaged.passUnretained(event)
        }

        if event.getIntegerValueField(.eventSourceUserData) == syntheticTag {
            return Unmanaged.passUnretained(event)
        }

        if type == .leftMouseDown || type == .rightMouseDown {
            resetBuffer()
            return Unmanaged.passUnretained(event)
        }

        if type == .flagsChanged {
            let flags = event.flags
            let hasCtrl = flags.contains(.maskControl)
            let hasShift = flags.contains(.maskShift)
            let hasCmdOrAlt = flags.contains(.maskCommand) || flags.contains(.maskAlternate)

            if hasCtrl && hasShift && !hasCmdOrAlt {
                ctrlShiftChordActive = true
                otherKeyPressedDuringChord = false
            } else if ctrlShiftChordActive && !hasCtrl && !hasShift {
                if !otherKeyPressedDuringChord {
                    AlifSettings.shared.isEnabled.toggle()
                    resetBuffer()
                }
                ctrlShiftChordActive = false
                otherKeyPressedDuringChord = false
            }
            return Unmanaged.passUnretained(event)
        }

        guard type == .keyDown else {
            return Unmanaged.passUnretained(event)
        }

        if ctrlShiftChordActive {
            otherKeyPressedDuringChord = true
        }

        let settings = AlifSettings.shared
        guard settings.isEnabled else {
            return Unmanaged.passUnretained(event)
        }

        let flags = event.flags
        if flags.contains(.maskCommand) || flags.contains(.maskControl) {
            resetBuffer()
            return Unmanaged.passUnretained(event)
        }

        let keyCode = CGKeyCode(event.getIntegerValueField(.keyboardEventKeycode))

        if keyCode == CGKeyCode(kVK_Delete) {
            if settings.instantUndo, let undo = lastReplacement {
                lastReplacement = nil
                prevChar = undo.original.last
                replacePreviousCharacter(with: undo.original)
                return nil
            }
            resetBuffer()
            return Unmanaged.passUnretained(event)
        }

        let resetKeys: Set<Int> = [
            kVK_Return, kVK_Tab, kVK_Escape, kVK_ForwardDelete,
            kVK_LeftArrow, kVK_RightArrow, kVK_UpArrow, kVK_DownArrow,
            kVK_Home, kVK_End, kVK_PageUp, kVK_PageDown
        ]
        if resetKeys.contains(Int(keyCode)) {
            resetBuffer()
            return Unmanaged.passUnretained(event)
        }

        var length = 0
        var chars = [UniChar](repeating: 0, count: 4)
        event.keyboardGetUnicodeString(maxStringLength: 4, actualStringLength: &length, unicodeString: &chars)
        guard length == 1, let scalar = UnicodeScalar(chars[0]) else {
            resetBuffer()
            return Unmanaged.passUnretained(event)
        }
        let currentChar = Character(scalar)

        if let prev = prevChar, let replacement = matchPair(prev: prev, curr: currentChar, settings: settings) {
            lastReplacement = (inserted: replacement, original: String(prev) + String(currentChar))
            prevChar = replacement.last
            replacePreviousCharacter(with: replacement)
            return nil
        }

        lastReplacement = nil
        prevChar = currentChar.isLetter ? currentChar : nil
        return Unmanaged.passUnretained(event)
    }

    private func matchPair(prev: Character, curr: Character, settings: AlifSettings) -> String? {
        let isApostrophe = ["'", "ʻ", "’", "‘", "ʼ", "`"].contains(curr)

        if settings.ruleO && isApostrophe && (prev == "o" || prev == "O") {
            return prev == "O" ? "Ö" : "ö"
        }
        if settings.ruleG && isApostrophe && (prev == "g" || prev == "G") {
            return prev == "G" ? "Ğ" : "ğ"
        }
        if settings.ruleSh && (curr == "h" || curr == "H") && (prev == "s" || prev == "S") {
            return prev == "S" ? "Ş" : "ş"
        }
        if settings.ruleCh && (curr == "h" || curr == "H") && (prev == "c" || prev == "C") {
            return prev == "C" ? "Ç" : "ç"
        }
        if settings.ruleNg && (curr == "g" || curr == "G") && (prev == "n" || prev == "N") {
            return prev == "N" ? "Ñ" : "ñ"
        }
        return nil
    }

    private func replacePreviousCharacter(with text: String) {
        let src = CGEventSource(stateID: .hidSystemState)

        if let bsDown = CGEvent(keyboardEventSource: src, virtualKey: CGKeyCode(kVK_Delete), keyDown: true),
           let bsUp = CGEvent(keyboardEventSource: src, virtualKey: CGKeyCode(kVK_Delete), keyDown: false) {
            bsDown.setIntegerValueField(.eventSourceUserData, value: syntheticTag)
            bsUp.setIntegerValueField(.eventSourceUserData, value: syntheticTag)
            bsDown.post(tap: .cghidEventTap)
            bsUp.post(tap: .cghidEventTap)
        }

        let utf16 = Array(text.utf16)
        if let txtDown = CGEvent(keyboardEventSource: src, virtualKey: 0, keyDown: true),
           let txtUp = CGEvent(keyboardEventSource: src, virtualKey: 0, keyDown: false) {
            txtDown.setIntegerValueField(.eventSourceUserData, value: syntheticTag)
            txtUp.setIntegerValueField(.eventSourceUserData, value: syntheticTag)
            txtDown.keyboardSetUnicodeString(stringLength: utf16.count, unicodeString: utf16)
            txtUp.keyboardSetUnicodeString(stringLength: utf16.count, unicodeString: utf16)
            txtDown.post(tap: .cghidEventTap)
            txtUp.post(tap: .cghidEventTap)
        }
    }
}

final class AppDelegate: NSObject, NSApplicationDelegate {
    private var statusItem: NSStatusItem!
    private var toggleMenuItem: NSMenuItem!

    func applicationDidFinishLaunching(_ notification: Notification) {
        statusItem = NSStatusBar.system.statusItem(withLength: NSStatusItem.variableLength)
        updateStatusIcon()
        buildMenu()

        NotificationCenter.default.addObserver(
            self,
            selector: #selector(onStateChanged),
            name: .alifStateChanged,
            object: nil
        )

        KeyboardEngine.shared.start()
    }

    @objc private func onStateChanged() {
        DispatchQueue.main.async {
            self.updateStatusIcon()
            self.toggleMenuItem.state = AlifSettings.shared.isEnabled ? .on : .off
            self.toggleMenuItem.title = AlifSettings.shared.isEnabled
                ? "Alif+ YOQILGAN (Ctrl + Shift)"
                : "Alif+ O‘CHIRILGAN (Ctrl + Shift)"
        }
    }

    private func updateStatusIcon() {
        guard let button = statusItem.button else { return }
        button.title = AlifSettings.shared.isEnabled ? "A+" : "A−"
        button.toolTip = AlifSettings.shared.isEnabled
            ? "Alif+ yoqilgan (o'→ö, g'→ğ, sh→ş, ch→ç)"
            : "Alif+ o‘chirilgan — yoqish uchun Ctrl+Shift bosing"
    }

    private func buildMenu() {
        let menu = NSMenu()

        toggleMenuItem = NSMenuItem(
            title: "Alif+ YOQILGAN (Ctrl + Shift)",
            action: #selector(toggleEnabled),
            keyEquivalent: ""
        )
        toggleMenuItem.state = AlifSettings.shared.isEnabled ? .on : .off
        menu.addItem(toggleMenuItem)
        menu.addItem(NSMenuItem.separator())

        let rulesHeader = NSMenuItem(title: "Harf qoidalari (Sozlamalar):", action: nil, keyEquivalent: "")
        rulesHeader.isEnabled = false
        menu.addItem(rulesHeader)

        menu.addItem(makeToggleItem("o' / O' → ö / Ö", isOn: AlifSettings.shared.ruleO, action: #selector(toggleRuleO)))
        menu.addItem(makeToggleItem("g' / G' → ğ / Ğ", isOn: AlifSettings.shared.ruleG, action: #selector(toggleRuleG)))
        menu.addItem(makeToggleItem("sh / Sh → ş / Ş", isOn: AlifSettings.shared.ruleSh, action: #selector(toggleRuleSh)))
        menu.addItem(makeToggleItem("ch / Ch → ç / Ç", isOn: AlifSettings.shared.ruleCh, action: #selector(toggleRuleCh)))
        menu.addItem(makeToggleItem("ng / Ng → ñ / Ñ", isOn: AlifSettings.shared.ruleNg, action: #selector(toggleRuleNg)))

        menu.addItem(NSMenuItem.separator())
        menu.addItem(makeToggleItem("Delete (⌫) bilan asl holiga qaytarish", isOn: AlifSettings.shared.instantUndo, action: #selector(toggleUndo)))

        menu.addItem(NSMenuItem.separator())
        menu.addItem(NSMenuItem(title: "Accessibility ruxsatini tekshirish...", action: #selector(openAccessibilitySettings), keyEquivalent: ""))
        menu.addItem(NSMenuItem(title: "Chiqish (Quit Alif+)", action: #selector(quitApp), keyEquivalent: "q"))

        statusItem.menu = menu
    }

    private func makeToggleItem(_ title: String, isOn: Bool, action: Selector) -> NSMenuItem {
        let item = NSMenuItem(title: title, action: action, keyEquivalent: "")
        item.state = isOn ? .on : .off
        return item
    }

    @objc private func toggleEnabled() { AlifSettings.shared.isEnabled.toggle() }
    @objc private func toggleRuleO(_ sender: NSMenuItem) { AlifSettings.shared.ruleO.toggle(); sender.state = AlifSettings.shared.ruleO ? .on : .off }
    @objc private func toggleRuleG(_ sender: NSMenuItem) { AlifSettings.shared.ruleG.toggle(); sender.state = AlifSettings.shared.ruleG ? .on : .off }
    @objc private func toggleRuleSh(_ sender: NSMenuItem) { AlifSettings.shared.ruleSh.toggle(); sender.state = AlifSettings.shared.ruleSh ? .on : .off }
    @objc private func toggleRuleCh(_ sender: NSMenuItem) { AlifSettings.shared.ruleCh.toggle(); sender.state = AlifSettings.shared.ruleCh ? .on : .off }
    @objc private func toggleRuleNg(_ sender: NSMenuItem) { AlifSettings.shared.ruleNg.toggle(); sender.state = AlifSettings.shared.ruleNg ? .on : .off }
    @objc private func toggleUndo(_ sender: NSMenuItem) { AlifSettings.shared.instantUndo.toggle(); sender.state = AlifSettings.shared.instantUndo ? .on : .off }

    @objc private func openAccessibilitySettings() {
        _ = KeyboardEngine.shared.checkAccessibility(prompt: true)
        if let url = URL(string: "x-apple.systempreferences:com.apple.preference.security?Privacy_Accessibility") {
            NSWorkspace.shared.open(url)
        }
    }

    @objc private func quitApp() {
        NSApplication.shared.terminate(nil)
    }
}

let app = NSApplication.shared
let delegate = AppDelegate()
app.delegate = delegate
app.setActivationPolicy(.accessory)
app.run()
