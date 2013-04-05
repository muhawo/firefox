#include<iostream>
#include<io.h>
#include <fstream>
#include <cstdio>
using namespace std;

void UTF8ToANSI(UINT CodePageTo, char *strFrom, char **strTo);
wstring UTF8ToUnicode( const string& str );
string UnicodeToANSI( const wstring& str );
