I have some little project and put them together, 3 add-ons and 1 plugin.
below addon:
  googleZoom@muhawo.com:
  A French friend want to remove the zoom effect of google image and then I developed this.
  This is my first little functional addon.
  
  accessKey@mozilla.org:
  The function is to browsering the internet through keyboard.
  After the ctrl key is pressed, hints(consist of two letters) will show beside elements of the page, and then you can access elements by hints.
  It is very simple and I am going to extend it.
  
  automenu_GL_Lee@163.com:
  I am working on this one. I want to get a tip image follow the mouse, and you can do three operations on it.
  1:moveover the tip image for some time , the relevant context menu will show.
  2.click on the tip image, a panel full of tools which are copies of elements from toolbar`s and BrowserToolbarPalette.
  3.right click the tip image, I am thinking about this.
 
below plugin:
  I just make a simlpe one for learn.It get child file and directory of a directory and then write the information into a xml file.
  Then interpret the xml with xslt to show them in a page as a tree.
**************************************************************************************************

为了方便查看且项目比较小就把之前做的放到一块了，一共有3个扩展小项目和一个插件的联系例子。
addon下面：
  googleZoom@muhawo.com：
  一个朋友想去除google图片的zoom效果，所以就做了这个，是自己第一个能运行且有点实际作用的扩展。
  
  accessKey@mozilla.org：
  扩展功能为通过给页面元素就行标号来实现键盘浏览网页。
  想法来自mozilla add-ons forum，实现功能比较简单，正在考虑进行功能添加。
  基本使用步骤：
    1：按ctrl键，按键后会显示标号（两个字母）。
    2：按下标号对应的字母，如果元素为链接进入该链接，输入框则将光标移到输入框，其他类元素执行其他操作。
  
  automenu_GL_Lee@163.com
  现在正在做的一个，要实现的功能是会有一悬浮按钮（其实只是panel内嵌一图片，非button）跟随鼠标，对这个悬浮按钮有三种操作，
　　1：悬浮于此按钮上一定时间自动弹出鼠标进入该按钮前所在元素对应的右键菜单
　　2：单击该按钮弹出一panel，panel内为工具按钮，工具按钮可以增删，来源为工具栏和BrowserToolbarPalette，但不影响他们。
　　3：右击该按钮弹出一些自定义操作，还未想好


plugin下面：
  插件方面只是做了一个简单的例子，主要是读取某目录下的所有文件及文件夹写到xml文件，
  然后用xslt解析该xml文件，将文件目录信息以树状格式显示在网页上。
  