#include <windows.h> 
#include<iostream>
#include<io.h>
#include <fstream>
#include <cstdio>
using namespace std;
wstring UTF8ToUnicode( const string& str );
char* UnicodeToANSI( const wstring& str );

void UTF8ToANSI(char *strFrom, char **strTo)
{
	wstring unicodeStr = UTF8ToUnicode(strFrom);
	*strTo = UnicodeToANSI(unicodeStr);

}

wstring UTF8ToUnicode( const string& str )
{
 int  len = 0;
 len = str.length();
 int  unicodeLen = ::MultiByteToWideChar( CP_UTF8,
            0,
            str.c_str(),
            -1,
            NULL,
            0 );  
 wchar_t *  pUnicode;  
 pUnicode = new  wchar_t[unicodeLen+1];  
 memset(pUnicode,0,(unicodeLen+1)*sizeof(wchar_t));  
 ::MultiByteToWideChar( CP_UTF8,
         0,
         str.c_str(),
         -1,
         (LPWSTR)pUnicode,
         unicodeLen );  
 wstring  rt;  
 rt = ( wchar_t* )pUnicode;
 delete  pUnicode; 
 
 return  rt;  
}

char * UnicodeToANSI( const wstring& str )
{
 char*     pElementText;
 int    iTextLen;
 // wide char to multi char
 iTextLen = WideCharToMultiByte( CP_ACP,
         0,
         str.c_str(),
         -1,
         NULL,
         0,
NULL,
         NULL );
 pElementText = new char[iTextLen + 1];
 memset( ( void* )pElementText, 0, sizeof( char ) * ( iTextLen + 1 ) );
 ::WideCharToMultiByte( CP_ACP,
         0,
         str.c_str(),
         -1,
         pElementText,
         iTextLen,
         NULL,
         NULL );
 return pElementText;
}
