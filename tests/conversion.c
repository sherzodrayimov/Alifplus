#include <assert.h>
#include "../windows/conversion.h"
int main(void) {
    wchar_t output[128];
    alif_convert(L"O'zbek G‘ayrat sh Sh SH ch Ch CH ma'no",output);
    assert(wcscmp(output,L"Özbek Ğayrat ş Ş Ş ç Ç Ç ma’no")==0);
    assert(alif_pair(L'S',L'H')==L'Ş');
    assert(alif_pair(L'C',L'h')==L'Ç');
    assert(alif_pair(L'0',L'\'')==0);
    return 0;
}
