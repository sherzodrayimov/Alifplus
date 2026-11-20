import Cocoa
import Carbon.HIToolbox
import ApplicationServices
import ServiceManagement

extension Notification.Name {
    static let alifStateChanged = Notification.Name("alifStateChanged")
    static let alifPermissionChanged = Notification.Name("alifPermissionChanged")
}

final class AlifSettings {
    static let shared = AlifSettings()
    private let defaults = UserDefaults.standard

    var isEnabled: Bool {
        didSet { NotificationCenter.default.post(name: .alifStateChanged, object: nil) }
    }

    var ruleOG: Bool {
        get { defaults.object(forKey: "ruleOG") as? Bool ?? true }
        set { defaults.set(newValue, forKey: "ruleOG") }
    }

    var ruleShCh: Bool {
        get { defaults.object(forKey: "ruleShCh") as? Bool ?? true }
        set { defaults.set(newValue, forKey: "ruleShCh") }
    }

    var instantUndo: Bool {
        get { defaults.object(forKey: "instantUndo") as? Bool ?? true }
        set { defaults.set(newValue, forKey: "instantUndo") }
    }

    var launchAtLogin: Bool {
        get { defaults.object(forKey: "launchAtLogin") as? Bool ?? false }
        set {
            defaults.set(newValue, forKey: "launchAtLogin")
            applyLaunchAtLogin(enabled: newValue)
        }
    }

    var startEnabled: Bool {
        get { defaults.object(forKey: "startEnabled") as? Bool ?? true }
        set { defaults.set(newValue, forKey: "startEnabled") }
    }

    var showHudOnToggle: Bool {
        get { defaults.object(forKey: "showHudOnToggle") as? Bool ?? true }
        set { defaults.set(newValue, forKey: "showHudOnToggle") }
    }

    var showGuideOnLaunch: Bool {
        get { defaults.object(forKey: "showGuideOnLaunch") as? Bool ?? false }
        set { defaults.set(newValue, forKey: "showGuideOnLaunch") }
    }

    var letterTimeout: Double {
        get { defaults.object(forKey: "letterTimeout") as? Double ?? 5.0 }
        set { defaults.set(newValue, forKey: "letterTimeout") }
    }

    var excludedAppsRaw: String {
        get {
            defaults.string(forKey: "excludedAppsRaw")
                ?? "1Password, Bitwarden, KeePassXC, Keychain Access, Terminal"
        }
        set { defaults.set(newValue, forKey: "excludedAppsRaw") }
    }

    private init() {
        self.isEnabled = UserDefaults.standard.object(forKey: "startEnabled") as? Bool ?? true
    }

    func isFrontmostAppExcluded() -> Bool {
        guard let frontApp = NSWorkspace.shared.frontmostApplication else { return false }
        let appName = (frontApp.localizedName ?? "").lowercased()
        let bundleId = (frontApp.bundleIdentifier ?? "").lowercased()
        let items = excludedAppsRaw
            .split(separator: ",")
            .map { $0.trimmingCharacters(in: .whitespacesAndNewlines).lowercased() }
            .filter { !$0.isEmpty }
        for item in items {
            if appName == item || appName.contains(item) || bundleId.contains(item) {
                return true
            }
        }
        return false
    }

    private func applyLaunchAtLogin(enabled: Bool) {
        if #available(macOS 13.0, *) {
            do {
                if enabled { try SMAppService.mainApp.register() }
                else { try SMAppService.mainApp.unregister() }
                return
            } catch {}
        }
        let fm = FileManager.default
        guard let libDir = fm.urls(for: .libraryDirectory, in: .userDomainMask).first else { return }
        let agentsDir = libDir.appendingPathComponent("LaunchAgents")
        let plistURL = agentsDir.appendingPathComponent("uz.alifplus.macos.plist")
        if enabled {
            try? fm.createDirectory(at: agentsDir, withIntermediateDirectories: true)
            let execPath = Bundle.main.executablePath ?? "/Applications/Alif+.app/Contents/MacOS/AlifPlus"
            let plist = "<?xml version=\"1.0\" encoding=\"UTF-8\"?><!DOCTYPE plist PUBLIC \"-//Apple//DTD PLIST 1.0//EN\" \"http://www.apple.com/DTDs/PropertyList-1.0.dtd\"><plist version=\"1.0\"><dict><key>Label</key><string>uz.alifplus.macos</string><key>ProgramArguments</key><array><string>\(execPath)</string></array><key>RunAtLoad</key><true/></dict></plist>"
            try? plist.write(to: plistURL, atomically: true, encoding: .utf8)
        } else {
            try? fm.removeItem(at: plistURL)
        }
    }
}

final class HudNotificationController {
    static let shared = HudNotificationController()
    private var panel: NSPanel?
    private var hideTimer: Timer?

    func show(enabled: Bool) {
        guard AlifSettings.shared.showHudOnToggle else { return }
        DispatchQueue.main.async {
            self.hideTimer?.invalidate()
            self.panel?.orderOut(nil)

            let width: CGFloat = 250
            let height: CGFloat = 54
            let screen = NSScreen.main ?? NSScreen.screens.first
            let frame = screen?.visibleFrame ?? NSRect(x: 0, y: 0, width: 1280, height: 800)
            let rect = NSRect(x: frame.midX - width / 2, y: frame.minY + 90, width: width, height: height)

            let p = NSPanel(contentRect: rect, styleMask: [.borderless, .nonactivatingPanel], backing: .buffered, defer: false)
            p.level = .floating
            p.isOpaque = false
            p.backgroundColor = .clear
            p.hasShadow = true
            p.ignoresMouseEvents = true
            p.collectionBehavior = [.canJoinAllSpaces, .fullScreenAuxiliary]

            let container = NSVisualEffectView(frame: NSRect(x: 0, y: 0, width: width, height: height))
            container.material = .hudWindow
            container.state = .active
            container.wantsLayer = true
            container.layer?.cornerRadius = 14
            container.layer?.masksToBounds = true
            container.layer?.borderWidth = 1
            container.layer?.borderColor = (enabled
                ? NSColor(red: 0.32, green: 0.95, blue: 0.66, alpha: 0.5)
                : NSColor.white.withAlphaComponent(0.18)).cgColor

            let badge = NSTextField(labelWithString: enabled ? "A+" : "A−")
            badge.font = NSFont.systemFont(ofSize: 16, weight: .heavy)
            badge.alignment = .center
            badge.textColor = enabled ? NSColor(red: 0.04, green: 0.10, blue: 0.24, alpha: 1.0) : .white
            badge.wantsLayer = true
            badge.layer?.backgroundColor = (enabled
                ? NSColor(red: 0.32, green: 0.95, blue: 0.66, alpha: 1.0)
                : NSColor.systemGray).cgColor
            badge.layer?.cornerRadius = 8
            badge.frame = NSRect(x: 14, y: 12, width: 34, height: 30)

            let label = NSTextField(labelWithString: enabled ? "Alif+ YOQILDI" : "Alif+ O‘CHIRILDI")
            label.font = NSFont.systemFont(ofSize: 15, weight: .semibold)
            label.textColor = .white
            label.frame = NSRect(x: 58, y: 16, width: width - 70, height: 22)

            container.addSubview(badge)
            container.addSubview(label)
            p.contentView = container
            p.orderFrontRegardless()
            self.panel = p

            self.hideTimer = Timer.scheduledTimer(withTimeInterval: 1.35, repeats: false) { _ in
                p.orderOut(nil)
            }
        }
    }
}


final class AlifSmartDict {
    static let shared = AlifSmartDict()
    private var uz = Set<String>(), rej = Set<String>(), sufs: [String] = [], ready = false
    private let lock = NSLock()
    private init() { DispatchQueue.global(qos: .userInitiated).async { self.load() } }
    private func norm(_ s: String) -> String { s.lowercased().replacingOccurrences(of: "ʻ", with: "'").replacingOccurrences(of: "’", with: "'").replacingOccurrences(of: "‘", with: "'").replacingOccurrences(of: "ʼ", with: "'").replacingOccurrences(of: "`", with: "'") }
    private func load() {
        var r = Set<String>(), sf: [String] = [], u = Set<String>(); u.reserveCapacity(300000)
        if let p = Bundle.main.url(forResource: "english_reject", withExtension: "txt"), let t = try? String(contentsOf: p, encoding: .utf8) { t.split(separator: "\n").forEach { let w = norm(String($0)); if !w.isEmpty { r.insert(w) } } }
        if let p = Bundle.main.url(forResource: "suffixes", withExtension: "txt"), let t = try? String(contentsOf: p, encoding: .utf8) { t.split(separator: "\n").forEach { let w = norm(String($0)); if !w.isEmpty { sf.append(w) } } }
        if let p = Bundle.main.url(forResource: "uzbek_dict", withExtension: "dat"), let t = try? String(contentsOf: p, encoding: .utf8) {
            var prev = ""
            for l in t.split(separator: "\n") {
                guard let a = l.first?.asciiValue, a >= 48 else { continue }
                let w = String(prev.prefix(Int(a - 48))) + l.dropFirst(); u.insert(w); prev = w
            }
        }
        lock.lock(); rej = r; sufs = sf; uz = u; ready = !u.isEmpty; lock.unlock()
    }
    private func inUz(_ w: String, _ u: Set<String>) -> Bool {
        u.contains(w) || (w.hasSuffix("g") && u.contains(String(w.dropLast()) + "k")) || (w.hasSuffix("g'") && u.contains(String(w.dropLast(2)) + "q"))
    }
    func shouldConvert(_ raw: String) -> Bool {
        var w = norm(raw)
        while w.hasPrefix("'") { w.removeFirst() }
        while w.hasSuffix("'") && !(w.dropLast().last == "o" || w.dropLast().last == "g") { w.removeLast() }
        if w.count < 2 { return false }
        lock.lock(); let (ok, r, u, sf) = (ready, rej, uz, sufs); lock.unlock()
        if r.contains(w) || w.split(separator: "-").contains(where: { $0.count > 1 && $0 != "chi" && r.contains(String($0)) }) { return false }
        let engSufs = ["ers","ing","tion","sion","ment","ness","able","ible","ship","hood","ware","ed","er","es","ly","s"]
        for es in engSufs where w.count > es.count + 2 && w.hasSuffix(es) {
            let rt = String(w.dropLast(es.count))
            if r.contains(rt) || r.contains(rt + "e") { return false }
        }
        if w.contains("o'") || w.contains("g'") { return true }
        if !ok { return !(w.contains("w") || w.contains("th") || w.contains("wh") || w.contains("ck") || w.contains("qu")) }
        if inUz(w, u) { return true }
        for s1 in sf where w.count > s1.count + 1 && w.hasSuffix(s1) {
            let st1 = String(w.dropLast(s1.count))
            if inUz(st1, u) { return true }
            if st1.count >= 4 { for s2 in sf where st1.count > s2.count + 1 && st1.hasSuffix(s2) { if inUz(String(st1.dropLast(s2.count)), u) { return true } } }
        }
        let eng = w.contains("w") || w.contains("th") || w.contains("wh") || w.contains("ck") || w.contains("qu") || w.contains("tch") || w.contains("dge")
        return !eng
    }
}

final class KeyboardEngine {
    static let shared = KeyboardEngine()
    private var eventTap: CFMachPort?
    private var runLoopSource: CFRunLoopSource?
    private var monitorTimer: Timer?
    private var prevChar: Character? = nil
    private var prevCharTime: Date? = nil
    private var lastReplacement: (inserted: String, original: String)? = nil
    private var rawWord = "", screenWord = "", userUndid = false
    private var ctrlShiftChordActive = false
    private var otherKeyPressedDuringChord = false
    private let syntheticTag: Int64 = 0x414C4946
    private(set) var hasPermission: Bool = false

    func start() {
        hasPermission = checkAccessibility(prompt: true)
        if hasPermission { installTap() }
        monitorTimer?.invalidate()
        monitorTimer = Timer.scheduledTimer(withTimeInterval: 1.2, repeats: true) { [weak self] _ in
            guard let self = self else { return }
            let trusted = self.checkAccessibility(prompt: false)
            if trusted != self.hasPermission {
                self.hasPermission = trusted
                NotificationCenter.default.post(name: .alifPermissionChanged, object: nil)
            }
            if trusted && self.eventTap == nil { self.installTap() }
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
        ) else { return }
        eventTap = tap
        runLoopSource = CFMachPortCreateRunLoopSource(kCFAllocatorDefault, tap, 0)
        if let source = runLoopSource {
            CFRunLoopAddSource(CFRunLoopGetCurrent(), source, .commonModes)
        }
        CGEvent.tapEnable(tap: tap, enable: true)
    }

    private func resetBuffer() { prevChar = nil; prevCharTime = nil; lastReplacement = nil; rawWord = ""; screenWord = ""; userUndid = false }

    private func handleEvent(proxy: CGEventTapProxy, type: CGEventType, event: CGEvent) -> Unmanaged<CGEvent>? {
        if type == .tapDisabledByTimeout || type == .tapDisabledByUserInput {
            if let tap = eventTap { CGEvent.tapEnable(tap: tap, enable: true) }
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
                    HudNotificationController.shared.show(enabled: AlifSettings.shared.isEnabled)
                }
                ctrlShiftChordActive = false
                otherKeyPressedDuringChord = false
            }
            return Unmanaged.passUnretained(event)
        }
        guard type == .keyDown else { return Unmanaged.passUnretained(event) }
        if ctrlShiftChordActive { otherKeyPressedDuringChord = true }

        let settings = AlifSettings.shared
        guard settings.isEnabled else { return Unmanaged.passUnretained(event) }
        if settings.isFrontmostAppExcluded() {
            resetBuffer()
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
                lastReplacement = nil; userUndid = true; if !screenWord.isEmpty { screenWord.removeLast() }; screenWord += undo.original
                prevChar = undo.original.last
                prevCharTime = Date()
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
            if (keyCode == CGKeyCode(kVK_Return) || keyCode == CGKeyCode(kVK_Tab)),
               !userUndid, !rawWord.isEmpty, rawWord != screenWord, !AlifSmartDict.shared.shouldConvert(rawWord) {
                let del = screenWord.count, txt = rawWord; resetBuffer()
                let src = CGEventSource(stateID: .hidSystemState)
                for _ in 0..<del {
                    if let d1 = CGEvent(keyboardEventSource: src, virtualKey: CGKeyCode(kVK_Delete), keyDown: true),
                       let u1 = CGEvent(keyboardEventSource: src, virtualKey: CGKeyCode(kVK_Delete), keyDown: false) {
                        d1.setIntegerValueField(.eventSourceUserData, value: syntheticTag)
                        u1.setIntegerValueField(.eventSourceUserData, value: syntheticTag)
                        d1.post(tap: .cghidEventTap); u1.post(tap: .cghidEventTap)
                    }
                }
                let u16 = Array(txt.utf16)
                if let d = CGEvent(keyboardEventSource: src, virtualKey: 0, keyDown: true),
                   let u = CGEvent(keyboardEventSource: src, virtualKey: 0, keyDown: false) {
                    d.setIntegerValueField(.eventSourceUserData, value: syntheticTag)
                    u.setIntegerValueField(.eventSourceUserData, value: syntheticTag)
                    d.keyboardSetUnicodeString(stringLength: u16.count, unicodeString: u16)
                    u.keyboardSetUnicodeString(stringLength: u16.count, unicodeString: u16)
                    d.post(tap: .cghidEventTap); u.post(tap: .cghidEventTap)
                }
            }
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
        let now = Date()

        if let prev = prevChar, let prevTime = prevCharTime {
            let timeout = settings.letterTimeout
            let withinWindow = (timeout <= 0) || (now.timeIntervalSince(prevTime) <= timeout)
            if withinWindow, let replacement = matchPair(prev: prev, curr: currentChar, settings: settings) {
                lastReplacement = (inserted: replacement, original: String(prev) + String(currentChar)); rawWord.append(currentChar); if !screenWord.isEmpty { screenWord.removeLast() }; screenWord += replacement
                prevChar = replacement.last
                prevCharTime = now
                replacePreviousCharacter(with: replacement)
                return nil
            }
        }

        let isApos = ["'", "ʻ", "’", "‘", "ʼ", "`"].contains(currentChar)
        let isWord = currentChar.isLetter || currentChar.isNumber || ((isApos || currentChar == "-") && !rawWord.isEmpty)
        if !isWord {
            if !userUndid && !rawWord.isEmpty && rawWord != screenWord && !AlifSmartDict.shared.shouldConvert(rawWord) {
                let del = screenWord.count, txt = rawWord + String(currentChar); resetBuffer()
                let src = CGEventSource(stateID: .hidSystemState)
                for _ in 0..<del {
                    CGEvent(keyboardEventSource: src, virtualKey: CGKeyCode(kVK_Delete), keyDown: true)?.post(tap: .cghidEventTap)
                    CGEvent(keyboardEventSource: src, virtualKey: CGKeyCode(kVK_Delete), keyDown: false)?.post(tap: .cghidEventTap)
                }
                let u16 = Array(txt.utf16)
                if let d = CGEvent(keyboardEventSource: src, virtualKey: 0, keyDown: true), let u = CGEvent(keyboardEventSource: src, virtualKey: 0, keyDown: false) {
                    d.setIntegerValueField(.eventSourceUserData, value: syntheticTag); u.setIntegerValueField(.eventSourceUserData, value: syntheticTag)
                    d.keyboardSetUnicodeString(stringLength: u16.count, unicodeString: u16); u.keyboardSetUnicodeString(stringLength: u16.count, unicodeString: u16)
                    d.post(tap: .cghidEventTap); u.post(tap: .cghidEventTap)
                }
                return nil
            }
            resetBuffer(); return Unmanaged.passUnretained(event)
        }
        lastReplacement = nil; rawWord.append(currentChar); screenWord.append(currentChar); prevChar = currentChar; prevCharTime = now
        return Unmanaged.passUnretained(event)
    }

    private func matchPair(prev: Character, curr: Character, settings: AlifSettings) -> String? {
        let isApostrophe = ["'", "ʻ", "’", "‘", "ʼ", "`"].contains(curr)
        if settings.ruleOG && isApostrophe && (prev == "o" || prev == "O") { return prev == "O" ? "Ö" : "ö" }
        if settings.ruleOG && isApostrophe && (prev == "g" || prev == "G") { return prev == "G" ? "Ğ" : "ğ" }
        if settings.ruleShCh && (curr == "h" || curr == "H") && (prev == "s" || prev == "S") { return prev == "S" ? "Ş" : "ş" }
        if settings.ruleShCh && (curr == "h" || curr == "H") && (prev == "c" || prev == "C") { return prev == "C" ? "Ç" : "ç" }
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

final class SettingsWindowController: NSWindowController, NSTextFieldDelegate {
    static let shared = SettingsWindowController()
    private var chkOG: NSButton!
    private var chkShCh: NSButton!
    private var chkUndo: NSButton!
    private var chkLaunchLogin: NSButton!
    private var chkStartEnabled: NSButton!
    private var chkShowHud: NSButton!
    private var chkShowGuide: NSButton!
    private var popupTimeout: NSPopUpButton!
    private var txtExcluded: NSTextField!
    private var btnPermStatus: NSButton!

    private let accentGreen = NSColor(red: 0.32, green: 0.95, blue: 0.66, alpha: 1.0)
    private let headerNavy = NSColor(red: 0.04, green: 0.10, blue: 0.24, alpha: 1.0)
    private let bodyDark = NSColor(red: 0.13, green: 0.14, blue: 0.15, alpha: 1.0)

    private init() {
        let width: CGFloat = 460
        let height: CGFloat = 670
        let win = NSWindow(
            contentRect: NSRect(x: 0, y: 0, width: width, height: height),
            styleMask: [.titled, .closable, .miniaturizable],
            backing: .buffered,
            defer: false
        )
        win.title = "Alif+ — Sozlamalar"
        win.isReleasedWhenClosed = false
        win.appearance = NSAppearance(named: .darkAqua)
        win.backgroundColor = NSColor(red: 0.13, green: 0.14, blue: 0.15, alpha: 1.0)
        win.center()
        super.init(window: win)
        setupUI(width: width, height: height)
        NotificationCenter.default.addObserver(self, selector: #selector(refreshPermissionBadge), name: .alifPermissionChanged, object: nil)
    }

    required init?(coder: NSCoder) { fatalError() }

    func showWindowAndFocus() {
        syncFromSettings()
        refreshPermissionBadge()
        NSApp.activate(ignoringOtherApps: true)
        window?.center()
        window?.makeKeyAndOrderFront(nil)
    }

    private func setupUI(width: CGFloat, height: CGFloat) {
        guard let root = window?.contentView else { return }
        root.wantsLayer = true
        root.layer?.backgroundColor = bodyDark.cgColor

        let headerH: CGFloat = 96
        let header = NSView(frame: NSRect(x: 0, y: height - headerH, width: width, height: headerH))
        header.wantsLayer = true
        header.layer?.backgroundColor = headerNavy.cgColor
        root.addSubview(header)

        let iconView = NSImageView(frame: NSRect(x: 24, y: 20, width: 56, height: 56))
        iconView.imageScaling = .scaleProportionallyUpOrDown
        iconView.wantsLayer = true
        iconView.layer?.cornerRadius = 13
        iconView.layer?.masksToBounds = true
        if let resPath = Bundle.main.path(forResource: "icon", ofType: "png"),
           let img = NSImage(contentsOfFile: resPath) {
            iconView.image = img
        } else {
            iconView.image = NSApp.applicationIconImage
        }
        header.addSubview(iconView)

        let titleLbl = NSTextField(labelWithString: "Sozlamalar")
        titleLbl.font = NSFont.systemFont(ofSize: 22, weight: .bold)
        titleLbl.textColor = .white
        titleLbl.frame = NSRect(x: 94, y: 46, width: 320, height: 28)
        header.addSubview(titleLbl)

        let subLbl = NSTextField(labelWithString: "Yangi alifbo yordamchisi  •  v2.1.0")
        subLbl.font = NSFont.systemFont(ofSize: 13, weight: .regular)
        subLbl.textColor = NSColor.white.withAlphaComponent(0.72)
        subLbl.frame = NSRect(x: 94, y: 23, width: 320, height: 20)
        header.addSubview(subLbl)

        var y: CGFloat = height - headerH - 28
        let leftX: CGFloat = 28
        let contentW: CGFloat = width - 56

        func addSectionHeader(_ text: String) {
            let lbl = NSTextField(labelWithString: text)
            lbl.font = NSFont.systemFont(ofSize: 11.5, weight: .bold)
            lbl.textColor = accentGreen
            lbl.frame = NSRect(x: leftX, y: y, width: contentW, height: 18)
            root.addSubview(lbl)
            y -= 26
        }

        func addCheckbox(_ title: String, action: Selector) -> NSButton {
            let btn = NSButton(checkboxWithTitle: title, target: self, action: action)
            btn.font = NSFont.systemFont(ofSize: 13.5, weight: .regular)
            btn.contentTintColor = .systemBlue
            btn.frame = NSRect(x: leftX, y: y, width: contentW, height: 22)
            root.addSubview(btn)
            y -= 27
            return btn
        }

        func addDivider() {
            y -= 4
            let line = NSBox(frame: NSRect(x: leftX, y: y, width: contentW, height: 1))
            line.boxType = .separator
            root.addSubview(line)
            y -= 18
        }

        addSectionHeader("ALMASHTIRISH QOIDALARI")
        chkOG = addCheckbox("o'  →  ö    va    g'  →  ğ", action: #selector(onSettingChanged))
        chkShCh = addCheckbox("sh  →  ş    va    ch  →  ç", action: #selector(onSettingChanged))
        chkUndo = addCheckbox("Delete (⌫) bilan asl holiga qaytarish", action: #selector(onSettingChanged))
        addDivider()

        addSectionHeader("ISHGA TUSHISH")
        chkLaunchLogin = addCheckbox("Kompyuter yonganda o'zi ishga tushsin", action: #selector(onSettingChanged))
        chkStartEnabled = addCheckbox("Ochilishi bilan darhol YOQILGAN bo'lsin", action: #selector(onSettingChanged))
        addDivider()

        addSectionHeader("KO'RINISH")
        chkShowHud = addCheckbox("Yoqilganda ekranda bildirishnoma chiqsin", action: #selector(onSettingChanged))
        chkShowGuide = addCheckbox("Ochilganda qo'llanma oynasi chiqsin", action: #selector(onSettingChanged))
        addDivider()

        addSectionHeader("HARFLAR ORASIDAGI TANAFFUS")
        popupTimeout = NSPopUpButton(frame: NSRect(x: leftX, y: y - 2, width: contentW, height: 26), pullsDown: false)
        popupTimeout.addItems(withTitles: ["Tez — 2 soniya", "Odatiy — 5 soniya", "Sekin — 10 soniya", "Cheksiz"])
        popupTimeout.target = self
        popupTimeout.action = #selector(onSettingChanged)
        root.addSubview(popupTimeout)
        y -= 26

        let timeoutHint = NSTextField(labelWithString: "Shundan uzoq kutilsа, harflar birlashtirilmaydi (masalan: s ... h).")
        timeoutHint.font = NSFont.systemFont(ofSize: 11.5)
        timeoutHint.textColor = NSColor.white.withAlphaComponent(0.58)
        timeoutHint.frame = NSRect(x: leftX, y: y, width: contentW, height: 18)
        root.addSubview(timeoutHint)
        y -= 14
        addDivider()

        addSectionHeader("BU DASTURLARDA ISHLAMASIN")
        let excLabel = NSTextField(labelWithString: "Masalan: Terminal, Xcode")
        excLabel.font = NSFont.systemFont(ofSize: 13)
        excLabel.textColor = .white
        excLabel.frame = NSRect(x: leftX, y: y, width: 165, height: 22)
        root.addSubview(excLabel)

        txtExcluded = NSTextField(frame: NSRect(x: leftX + 168, y: y - 1, width: contentW - 168, height: 24))
        txtExcluded.font = NSFont.systemFont(ofSize: 12.5)
        txtExcluded.placeholderString = "1Password, Bitwarden, Terminal"
        txtExcluded.delegate = self
        root.addSubview(txtExcluded)
        y -= 24

        let excHint = NSTextField(labelWithString: "Dastur nomlarini vergul bilan ajrating.")
        excHint.font = NSFont.systemFont(ofSize: 11.5)
        excHint.textColor = NSColor.white.withAlphaComponent(0.58)
        excHint.frame = NSRect(x: leftX, y: y, width: contentW, height: 18)
        root.addSubview(excHint)
        y -= 14
        addDivider()

        btnPermStatus = NSButton(title: "Ruxsat berilgan", target: self, action: #selector(onPermClicked))
        btnPermStatus.bezelStyle = .rounded
        btnPermStatus.font = NSFont.systemFont(ofSize: 12, weight: .semibold)
        btnPermStatus.frame = NSRect(x: leftX, y: 18, width: 175, height: 26)
        root.addSubview(btnPermStatus)

        let shortcutLbl = NSTextField(labelWithString: "Yoqib-o'chirish:  Ctrl + Shift")
        shortcutLbl.font = NSFont.systemFont(ofSize: 13, weight: .semibold)
        shortcutLbl.alignment = .right
        shortcutLbl.textColor = .white
        shortcutLbl.frame = NSRect(x: width - 245, y: 21, width: 217, height: 20)
        root.addSubview(shortcutLbl)

        syncFromSettings()
        refreshPermissionBadge()
    }

    private func syncFromSettings() {
        let s = AlifSettings.shared
        chkOG.state = s.ruleOG ? .on : .off
        chkShCh.state = s.ruleShCh ? .on : .off
        chkUndo.state = s.instantUndo ? .on : .off
        chkLaunchLogin.state = s.launchAtLogin ? .on : .off
        chkStartEnabled.state = s.startEnabled ? .on : .off
        chkShowHud.state = s.showHudOnToggle ? .on : .off
        chkShowGuide.state = s.showGuideOnLaunch ? .on : .off
        txtExcluded.stringValue = s.excludedAppsRaw
        switch s.letterTimeout {
        case 2.0: popupTimeout.selectItem(at: 0)
        case 10.0: popupTimeout.selectItem(at: 2)
        case 0.0: popupTimeout.selectItem(at: 3)
        default: popupTimeout.selectItem(at: 1)
        }
    }

    @objc private func onSettingChanged() {
        let s = AlifSettings.shared
        s.ruleOG = (chkOG.state == .on)
        s.ruleShCh = (chkShCh.state == .on)
        s.instantUndo = (chkUndo.state == .on)
        s.launchAtLogin = (chkLaunchLogin.state == .on)
        s.startEnabled = (chkStartEnabled.state == .on)
        s.showHudOnToggle = (chkShowHud.state == .on)
        s.showGuideOnLaunch = (chkShowGuide.state == .on)
        switch popupTimeout.indexOfSelectedItem {
        case 0: s.letterTimeout = 2.0
        case 2: s.letterTimeout = 10.0
        case 3: s.letterTimeout = 0.0
        default: s.letterTimeout = 5.0
        }
    }

    func controlTextDidChange(_ obj: Notification) {
        AlifSettings.shared.excludedAppsRaw = txtExcluded.stringValue
    }

    @objc private func refreshPermissionBadge() {
        let ok = KeyboardEngine.shared.checkAccessibility(prompt: false)
        if ok {
            btnPermStatus.title = "● Ruxsat berilgan"
            btnPermStatus.contentTintColor = accentGreen
        } else {
            btnPermStatus.title = "⚠️ Ruxsat berish..."
            btnPermStatus.contentTintColor = .systemOrange
        }
    }

    @objc private func onPermClicked() {
        _ = KeyboardEngine.shared.checkAccessibility(prompt: true)
        if let url = URL(string: "x-apple.systempreferences:com.apple.preference.security?Privacy_Accessibility") {
            NSWorkspace.shared.open(url)
        }
    }
}

final class GuideWindowController: NSWindowController {
    static let shared = GuideWindowController()

    private init() {
        let win = NSWindow(
            contentRect: NSRect(x: 0, y: 0, width: 430, height: 320),
            styleMask: [.titled, .closable],
            backing: .buffered,
            defer: false
        )
        win.title = "Alif+ — Tezkor qo‘llanma"
        win.isReleasedWhenClosed = false
        win.appearance = NSAppearance(named: .darkAqua)
        win.center()
        super.init(window: win)

        guard let root = win.contentView else { return }
        let text = NSTextView(frame: NSRect(x: 20, y: 54, width: 390, height: 245))
        text.isEditable = false
        text.drawsBackground = false
        text.textColor = .white
        text.font = NSFont.systemFont(ofSize: 13.5)
        text.string = """
        Alif+ — Yangi o‘zbek alifbosi yordamchisi

        1. Yoqish va o‘chirish:
           Istalgan dasturda Ctrl + Shift tugmalarini birga bosing.

        2. Avtomatik o‘zgaradigan harflar:
           • o' / O'  →  ö / Ö
           • g' / G'  →  ğ / Ğ
           • sh / Sh  →  ş / Ş
           • ch / Ch  →  ç / Ç

        3. Darhol bekor qilish:
           O‘zgargan harfni asl holiga qaytarish uchun darhol Delete (⌫) bosing.

        4. Muhim eslatma (Accessibility):
           Agar dasturni yangilab qayta o‘rnatsangiz, System Settings → Privacy & Security → Accessibility ro‘yxatidan eski Alif+ ni (–) bilan o‘chirib, yangisini (+) qo‘shing.
        """
        root.addSubview(text)

        let closeBtn = NSButton(title: "Tushunarli", target: self, action: #selector(closeGuide))
        closeBtn.bezelStyle = .rounded
        closeBtn.frame = NSRect(x: 300, y: 14, width: 110, height: 28)
        root.addSubview(closeBtn)
    }

    required init?(coder: NSCoder) { fatalError() }

    func showGuide() {
        NSApp.activate(ignoringOtherApps: true)
        window?.center()
        window?.makeKeyAndOrderFront(nil)
    }

    @objc private func closeGuide() { window?.close() }
}

final class AppDelegate: NSObject, NSApplicationDelegate {
    private var statusItem: NSStatusItem!
    private var toggleMenuItem: NSMenuItem!
    private var permMenuItem: NSMenuItem!

    func applicationDidFinishLaunching(_ notification: Notification) {
        let mainMenu = NSMenu()
        let editMenuItem = NSMenuItem()
        mainMenu.addItem(editMenuItem)
        let editMenu = NSMenu(title: "Edit")
        editMenu.addItem(withTitle: "Cut", action: #selector(NSText.cut(_:)), keyEquivalent: "x")
        editMenu.addItem(withTitle: "Copy", action: #selector(NSText.copy(_:)), keyEquivalent: "c")
        editMenu.addItem(withTitle: "Paste", action: #selector(NSText.paste(_:)), keyEquivalent: "v")
        editMenu.addItem(withTitle: "Select All", action: #selector(NSText.selectAll(_:)), keyEquivalent: "a")
        editMenuItem.submenu = editMenu
        NSApp.mainMenu = mainMenu

        statusItem = NSStatusBar.system.statusItem(withLength: NSStatusItem.variableLength)
        buildMenu()
        updateStatusIcon()

        NotificationCenter.default.addObserver(self, selector: #selector(onStateChanged), name: .alifStateChanged, object: nil)
        NotificationCenter.default.addObserver(self, selector: #selector(onPermissionChanged), name: .alifPermissionChanged, object: nil)

        KeyboardEngine.shared.start()
        updateStatusIcon()

        if !KeyboardEngine.shared.checkAccessibility(prompt: false) {
            NSApp.activate(ignoringOtherApps: true)
            let alert = NSAlert()
            alert.messageText = "Alif+ uchun Accessibility ruxsati kerak"
            alert.informativeText = "Agar Alif+ ni o‘chirib qayta yuklagan bo‘lsangiz, System Settings → Privacy & Security → Accessibility ro‘yxatidan eski Alif+ ni minus (–) bilan o‘chirib, yangisini yoqing."
            alert.addButton(withTitle: "Sozlamalarni ochish")
            alert.addButton(withTitle: "Keyinroq")
            if alert.runModal() == .alertFirstButtonReturn { openAccessibilitySettings() }
        } else if AlifSettings.shared.showGuideOnLaunch {
            GuideWindowController.shared.showGuide()
        }
    }

    @objc private func onStateChanged() {
        DispatchQueue.main.async {
            self.updateStatusIcon()
            self.toggleMenuItem.state = AlifSettings.shared.isEnabled ? .on : .off
            self.toggleMenuItem.title = AlifSettings.shared.isEnabled ? "Alif+ YOQILGAN (Ctrl + Shift)" : "Alif+ O‘CHIRILGAN (Ctrl + Shift)"
        }
    }

    @objc private func onPermissionChanged() {
        DispatchQueue.main.async { self.updateStatusIcon() }
    }

    private func updateStatusIcon() {
        guard let button = statusItem.button else { return }
        if !KeyboardEngine.shared.checkAccessibility(prompt: false) {
            button.title = "A+ ⚠️"
            permMenuItem?.title = "⚠️ Accessibility ruxsatini yoqish..."
        } else {
            button.title = AlifSettings.shared.isEnabled ? "A+" : "A−"
            permMenuItem?.title = "✓ Accessibility ruxsati faol"
        }
    }

    private func buildMenu() {
        let menu = NSMenu()
        toggleMenuItem = NSMenuItem(
            title: AlifSettings.shared.isEnabled ? "Alif+ YOQILGAN (Ctrl + Shift)" : "Alif+ O‘CHIRILGAN (Ctrl + Shift)",
            action: #selector(toggleEnabled),
            keyEquivalent: ""
        )
        toggleMenuItem.state = AlifSettings.shared.isEnabled ? .on : .off
        menu.addItem(toggleMenuItem)
        menu.addItem(NSMenuItem.separator())
        menu.addItem(NSMenuItem(title: "Sozlamalar...", action: #selector(openSettings), keyEquivalent: ","))
        menu.addItem(NSMenuItem(title: "Qo‘llanma...", action: #selector(openGuide), keyEquivalent: ""))
        menu.addItem(NSMenuItem.separator())
        permMenuItem = NSMenuItem(title: "Accessibility ruxsatini tekshirish...", action: #selector(openAccessibilitySettings), keyEquivalent: "")
        menu.addItem(permMenuItem)
        menu.addItem(NSMenuItem.separator())
        menu.addItem(NSMenuItem(title: "Chiqish (Quit Alif+)", action: #selector(quitApp), keyEquivalent: "q"))
        statusItem.menu = menu
    }

    @objc private func toggleEnabled() {
        AlifSettings.shared.isEnabled.toggle()
        HudNotificationController.shared.show(enabled: AlifSettings.shared.isEnabled)
    }

    @objc private func openSettings() { SettingsWindowController.shared.showWindowAndFocus() }
    @objc private func openGuide() { GuideWindowController.shared.showGuide() }

    @objc private func openAccessibilitySettings() {
        _ = KeyboardEngine.shared.checkAccessibility(prompt: true)
        if let url = URL(string: "x-apple.systempreferences:com.apple.preference.security?Privacy_Accessibility") {
            NSWorkspace.shared.open(url)
        }
    }

    @objc private func quitApp() { NSApplication.shared.terminate(nil) }
}

let app = NSApplication.shared
let delegate = AppDelegate()
app.delegate = delegate
app.setActivationPolicy(.accessory)
app.run()
