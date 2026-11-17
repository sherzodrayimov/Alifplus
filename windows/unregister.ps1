$ErrorActionPreference = "SilentlyContinue"
$tip = "0443:a0000443"
$langs = Get-WinUserLanguageList
foreach ($l in $langs) {
    if ($l.InputMethodTips -contains $tip) {
        $l.InputMethodTips.Remove($tip) | Out-Null
    }
}
Set-WinUserLanguageList $langs -Force
