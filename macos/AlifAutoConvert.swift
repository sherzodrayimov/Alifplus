import Cocoa
import Carbon

final class AlifAutoConvertApp: NSObject, NSApplicationDelegate {
    private var statusItem: NSStatusItem!
    private var toggleMenuItem: NSMenuItem!
    private var isEnabled: Bool = true
    private var eventTap: CFMachPort?
    private var prevChar: Character? = nil
    private var isInjecting: Bool = false

    func applicationDidFinishLaunching(_ notification: Notification) {
        statusItem = NSStatusBar.system.statusItem(withLength: NSStatusItem.variableLength)
        statusItem.button?.title = "ÖZ⇄"

        let menu = NSMenu()
        toggleMenuItem = NSMenuItem(title: "✓ Avto-o‘girish faol (o‘/g‘/sh/ch → ö/ğ/ş/ç)", action: #selector(toggleAutoConvert), keyEquivalent: "t")
        toggleMenuItem.target = self
        menu.addItem(toggleMenuItem)

        let clipItem = NSMenuItem(title: "Buferdagi (Clipboard) eski matnni o‘girish", action: #selector(convertClipboardText), keyEquivalent: "v")
        clipItem.target = self
        menu.addItem(clipItem)

        menu.addItem(NSMenuItem.separator())

        let quitItem = NSMenuItem(title: "Chiqish", action: #selector(quitApp), keyEquivalent: "q")
        quitItem.target = self
        menu.addItem(quitItem)

        statusItem.menu = menu
        setupEventTap()
    }

    @objc private func toggleAutoConvert() {
        isEnabled.toggle()
        prevChar = nil
        statusItem.button?.title = isEnabled ? "ÖZ⇄" : "ÖZ"
        toggleMenuItem.title = isEnabled
            ? "✓ Avto-o‘girish faol (o‘/g‘/sh/ch → ö/ğ/ş/ç)"
            : "Avto-o‘girish o‘chiq (yoqish)"
    }

    @objc private func convertClipboardText() {
        let pb = NSPasteboard.general
        guard let str = pb.string(forType: .string) else { return }
        let converted = Self.convertFullText(str)
        pb.clearContents()
        pb.setString(converted, forType: .string)
    }

    @objc private func quitApp() {
        NSApp.terminate(nil)
    }

    static func convertFullText(_ text: String) -> String {
        var s = text
        // o' / o‘ / o’ / oʻ / oʼ -> ö
        let apos = "['‘’ʻʼ`]"
        let rules: [(String, String)] = [
            ("O" + apos, "Ö"),
            ("o" + apos, "ö"),
            ("G" + apos, "Ğ"),
            ("g" + apos, "ğ"),
            ("SH", "Ş"),
            ("Sh", "Ş"),
            ("sh", "ş"),
            ("CH", "Ç"),
            ("Ch", "Ç"),
            ("ch", "ç"),
            ("(?<=[A-Za-zÖöĞğŞşÇç])" + apos + "(?=[A-Za-zÖöĞğŞşÇç])", "’")
        ]
        for (pattern, replacement) in rules {
            if let regex = try? NSRegularExpression(pattern: pattern, options: []) {
                let range = NSRange(s.startIndex..<s.endIndex, in: s)
                s = regex.stringByReplacingMatches(in: s, options: [], range: range, withTemplate: replacement)
            }
        }
        return s
    }

    private func setupEventTap() {
        let options = [kAXTrustedCheckOptionPrompt.takeUnretainedValue() as String: true] as CFDictionary
        _ = AXIsProcessTrustedWithOptions(options)

        let mask = (1 << CGEventType.keyDown.rawValue)
        let refcon = UnsafeMutableRawPointer(Unmanaged.passUnretained(self).toOpaque())

        guard let tap = CGEvent.tapCreate(
            tap: .cgSessionEventTap,
            place: .headInsertEventTap,
            options: .defaultTap,
            eventsOfInterest: CGEventMask(mask),
            callback: { (_, type, event, refcon) -> Unmanaged<CGEvent>? in
                guard let refcon = refcon else { return Unmanaged.passUnretained(event) }
                let app = Unmanaged<AlifAutoConvertApp>.fromOpaque(refcon).takeUnretainedValue()
                return app.handleKeyEvent(type: type, event: event)
            },
            userInfo: refcon
        ) else {
            return
        }

        eventTap = tap
        let runLoopSource = CFMachPortCreateRunLoopSource(kCFAllocatorDefault, tap, 0)
        CFRunLoopAddSource(CFRunLoopGetCurrent(), runLoopSource, .commonModes)
        CGEvent.tapEnable(tap: tap, enable: true)
    }

    private func handleKeyEvent(type: CGEventType, event: CGEvent) -> Unmanaged<CGEvent>? {
        if type == .tapDisabledByTimeout || type == .tapDisabledByUserInput {
            if let tap = eventTap { CGEvent.tapEnable(tap: tap, enable: true) }
            return Unmanaged.passUnretained(event)
        }
        guard isEnabled, !isInjecting, type == .keyDown else {
            return Unmanaged.passUnretained(event)
        }

        let flags = event.flags
        if flags.contains(.maskCommand) || flags.contains(.maskControl) || flags.contains(.maskAlternate) {
            prevChar = nil
            return Unmanaged.passUnretained(event)
        }

        var chars = [UniChar](repeating: 0, count: 4)
        var length = 0
        event.keyboardGetUnicodeString(maxStringLength: 4, actualStringLength: &length, unicodeString: &chars)
        guard length == 1, let scalar = UnicodeScalar(chars[0]) else {
            prevChar = nil
            return Unmanaged.passUnretained(event)
        }

        let ch = Character(scalar)
        let isApos = (ch == "'" || ch == "‘" || ch == "’" || ch == "ʻ" || ch == "ʼ" || ch == "`")

        if let p = prevChar {
            var replacement: String? = nil
            if (p == "o" && isApos) { replacement = "ö" }
            else if (p == "O" && isApos) { replacement = "Ö" }
            else if (p == "g" && isApos) { replacement = "ğ" }
            else if (p == "G" && isApos) { replacement = "Ğ" }
            else if (p == "s" && (ch == "h" || ch == "H")) { replacement = "ş" }
            else if (p == "S" && (ch == "h" || ch == "H")) { replacement = "Ş" }
            else if (p == "c" && (ch == "h" || ch == "H")) { replacement = "ç" }
            else if (p == "C" && (ch == "h" || ch == "H")) { replacement = "Ç" }

            if let rep = replacement {
                prevChar = nil
                injectBackspaceAndText(rep)
                return nil
            }
        }

        // Convert standalone straight apostrophe after a letter to proper ’
        if ch == "'", let p = prevChar, p.isLetter {
            prevChar = nil
            injectText("’")
            return nil
        }

        prevChar = ch.isLetter ? ch : nil
        return Unmanaged.passUnretained(event)
    }

    private func injectBackspaceAndText(_ text: String) {
        isInjecting = true
        defer { isInjecting = false }

        let src = CGEventSource(stateID: .hidSystemState)
        if let bsDown = CGEvent(keyboardEventSource: src, virtualKey: 51, keyDown: true),
           let bsUp = CGEvent(keyboardEventSource: src, virtualKey: 51, keyDown: false) {
            bsDown.post(tap: .cghidEventTap)
            bsUp.post(tap: .cghidEventTap)
        }
        injectTextRaw(text, src: src)
    }

    private func injectText(_ text: String) {
        isInjecting = true
        defer { isInjecting = false }
        let src = CGEventSource(stateID: .hidSystemState)
        injectTextRaw(text, src: src)
    }

    private func injectTextRaw(_ text: String, src: CGEventSource?) {
        let utf16 = Array(text.utf16)
        if let down = CGEvent(keyboardEventSource: src, virtualKey: 0, keyDown: true),
           let up = CGEvent(keyboardEventSource: src, virtualKey: 0, keyDown: false) {
            down.keyboardSetUnicodeString(stringLength: utf16.count, unicodeString: utf16)
            up.keyboardSetUnicodeString(stringLength: utf16.count, unicodeString: utf16)
            down.post(tap: .cghidEventTap)
            up.post(tap: .cghidEventTap)
        }
    }
}

let app = NSApplication.shared
app.setActivationPolicy(.accessory)
let delegate = AlifAutoConvertApp()
app.delegate = delegate
app.run()
