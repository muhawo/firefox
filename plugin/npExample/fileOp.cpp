#include<iostream>
#include<io.h>
#include <fstream>
#include <cstdio>
using namespace std;

static int level=0;
void fileOp(ofstream *fout, char *filespec)
{
	_finddata_t file;
	long lf;
	char strItem[1024];
	char filespec1[1024];
	memset(strItem, NULL, sizeof(strItem));
	memset(filespec1, NULL, sizeof(filespec1));


	if((lf = _findfirst(filespec, &file))==-1l)//_findfirst返回的是long型; long __cdecl _findfirst(const char *, struct _finddata_t *)
	cout<<"文件没有找到!\n";
	else
	{
	_findnext( lf, &file );
	level++;
	while( _findnext( lf, &file ) == 0 )//int __cdecl _findnext(long, struct _finddata_t *);如果找到下个文件的名字成功的话就返回0,否则返回-1
	{
		if(file.attrib == _A_SUBDIR)
		{
			sprintf_s(strItem, "<item>\n<name>%s</name>\n<flg>0</flg>\n<level>level%d</level>", file.name, level);
			*fout << strItem<<endl; 
			strcpy(filespec1,filespec);
			filespec1[strlen(filespec1)-3] = '\0';
			strcat(filespec1,file.name);
			strcat(filespec1,"\\*.*");
			fileOp(fout, filespec1);
			sprintf_s(strItem, "</item>", file.name);
			*fout << strItem<<endl; 
		}
		else
		{
			sprintf_s(strItem, "<item>\n<name>%s</name>\n<flg>1</flg>\n<level>level%d</level>\n</item>", file.name, level);
			*fout << strItem<<endl; 
		}
	}
	}
	level--;
	_findclose(lf);
}
