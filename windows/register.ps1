$ErrorActionPreference = "SilentlyContinue"
$tip = "0443:a0000443"
$langs = Get-WinUserLanguageList
$uz = $langs | Where-Object { $_.LanguageTag -like "uz-Latn*" } | Select-Object -First 1

if ($null -eq $uz) {
    $uz = New-WinUserLanguageList -Language "uz-Latn-UZ"
    $uz[0].InputMethodTips.Clear()
    $uz[0].InputMethodTips.Add($tip)
    $langs.Add($uz[0])
} else {
    if (-not ($uz.InputMethodTips -contains $tip)) {
        $uz.InputMethodTips.Add($tip)
    }
}
Set-WinUserLanguageList $langs -Force
