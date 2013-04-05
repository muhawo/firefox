<?xml version="1.0" encoding="GB2312"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

<xsl:template match="/">
<html>
<head>
	<title>scriptable plug-in test</title>
	<meta http-equiv="content-type" content="text/html; charset=GB2312" />
	<link type="text/css" rel="stylesheet" href="local/mystyle.css"/>
	<script type="text/javascript" src="local/myjs.js"/>
</head>
<body id="bodyid">

<div id="main">
	<div id="top">
		<input type="button" value="open" onclick="alert(embed1.open('f:\\dianying\\*.*'));"/>
		<embed id="embed1" type="application/mozilla-npruntime-scriptable-plugin" width="600" height="30"></embed>
	</div>

	<div id="result" class="resizeMe" >
		<div class="level0">
		<p onclick="display(this.nextSibling)">movies</p>
	    <ul>
			<xsl:apply-templates select="movies/item" > 
			<xsl:sort select="flg"/>
			</xsl:apply-templates>
	    </ul>
	    </div>
	</div>
</div>

</body>
</html>
</xsl:template>

<xsl:template match="item">
	<xsl:apply-templates select=".[flg='0']" mode="directory"/> 
	<xsl:apply-templates select=".[flg='1']" mode="file"/> 
</xsl:template>

<xsl:template match="item" mode="directory">
	    <xsl:for-each select=".">
		    <li class="directory" onclick="display(this.nextSibling)">
				<p><xsl:value-of select="name"/></p>
		    </li>
		    <div>
		    	<xsl:attribute name="class">
		    		<xsl:value-of select="level"/>
		    	</xsl:attribute>
			<xsl:apply-templates select="./item" > 
				<xsl:sort select="flg"/>
			</xsl:apply-templates>
			</div>
	    </xsl:for-each>
</xsl:template>

<xsl:template match="item" mode="file">
	    <xsl:for-each select=".">
	      <li class="file">
				<p><xsl:value-of select="name"/></p>
	      </li>
	    </xsl:for-each>
</xsl:template>

</xsl:stylesheet>

