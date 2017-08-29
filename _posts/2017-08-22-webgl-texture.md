---
title: WebGL中的纹理
date: 2017-08-22 19:00
tags: [webgl, texture]
---

## 本节内容

了解纹理贴图的基本概念。
什么是映射纹理？
如何在WebGL中载入纹理？
纹理的是伸展(magnification)与收缩(minification)模式。
纹理的过滤和Mip映射。

## 为什么要使用纹理

在前一节中，我们了解了如何绘制彩色的图形，如何内插出平滑的颜色渐变效果。但如果显示一堵逼真的砖墙，问题就来了。你可能会试图创建很多个三角形，指定它们的颜色和位置来模拟墙面上的坑坑洼洼。如果真的这么做了，那就陷入了繁琐和无意义的苦海中。在三维图形学中，有一项很重要的技术可以解决这个问题。那就是 *纹理映射* 。下面我们来深入了解一下。

  ![墙体](/assets/image/blog/webgl/wall.jpg)


### 纹理映射
从字面理解，就是使用图片渲染在物体的表面上，WebGL中最常见的纹理格式是2D纹理。纹理映射，就是将一张图（就像一张纸）映射（贴）到一个几何图形的表面上去。将一张真实世界的图片贴到一个由两个三角形组成的矩形上，这样矩形表面看上就是这张图片。此时，这张图片又可以称为 **纹理图片**(texture image) 或 *纹理*(texture) 。
纹理映射的作用，就是根据纹理图像，为之前光栅后的每个片元涂上合适的颜色。组成纹理图像的像素又被称为 **纹素** （texel,texture elements）, 每个纹素的颜色都使用RGB或RGBA格式编码。

 * **纹理图像**：映射的这个图像称为纹理图像
 * **纹素**：组成纹理图像的像素称为纹素
 * **纹理坐标**：是纹理图像上的坐标，通过纹理坐标可以在纹理图像上获取纹素颜色

在WebGL中要进行纹理映射，需遵循以下几个步骤：
* 准备好映射到几何图形上的纹理图像。
* 为几何图形配置纹理映射方式。
* 加载纹理图像，对其进行写配置，以在WebGL中使用它。
* 在片元着色器中将相应的纹理从纹理中抽取出来，并将纹素的颜色赋给片元。

### 纹理坐标：

我们使用图形的顶点坐标来确定屏幕上哪些部分被纹理图像覆盖，同理要使用 *纹理坐标* (texture coordinates) 来确定纹理图像的哪些部分将覆盖到几何图形上。纹理坐标是一套新坐标系统，下面就来仔细研究一下。
*纹理坐标* 是纹理图像上的坐标。通过纹理坐标可以在纹理图像上获取纹素颜色。WebGL系统中的纹理坐标系统是二维的。为了将纹理坐标与广泛使用的x坐标和y坐标区分开来，WebGL使用s与t命名纹理坐标（st坐标系统）。

  ![纹理坐标](/assets/image/blog/webgl/texture-coord.png)

纹理图像的四个角坐标为左下角（0.0，0.0），右下角（1.0,0.0），右上角（1.0， 1.0）和左上角（0.0， 1.0）。纹理坐标很通用，因为坐标值与图像自身的尺寸无关，不管是128*128还是128*256的图像，右上角的纹理坐标始终是(1.0, 1.0)。

## 载入纹理
为了把纹理应用于几何对象，首先需要载入纹理。图像文件可以是PNG、JPEG、GIF格式。
### 创建WebGLTexture对象 
在WebGL中使用纹理的第一个步骤主为每一个纹理创建一个WebGLTexture对象。创建纹理对象要使用下面的代码。WebGLTexture是一个容器对象，它可以作为纹理的对象，通过它访问与此纹理有关的处理参数。
  ```javascript
    //声明纹理对象
    var texture = gl.createTexture();

    // 删除纹理
    gl.deleteTexture(texture);
  ```
注意，当结束使用纹理时，并不需要调用gl.deleteTexture()方法。javascript垃圾收集在销毁WebGLTexture对象会自动删除相应的纹理对象。这个gl.deleteTexture方法只是给用户提供更灵活的控制权，控制何时销毁纹理对象。

### 绑定与解绑纹理
在对新创建的纹理对象做任何操作之前，首先需要把它绑定为当前纹理对象。如下，把一个名为texture的纹理对象绑定为一个2D纹理对象。

  ```javascript
    //绑定纹理
    gl.bindTexture(gl.TEXTURE_2D,texture);
    //解绑纹理
    gl.bindTexture(gl.TEXTURE_2D, null);
  ```
  调用gl.bindTexture()可告诉WebGL，这就是从现在起需要操作的纹理对象。如同gl.bindBuffer()方法与WebGLBuffer缓冲对象的关系。

### 载入图像数据
绑定纹理对象后，就可以把图像数据载入纹理对象中。意味着，把纹理数据上传到GPU（或GPU可以访问的内存）。把纹理数据上传给GPU要使用gl.texImage2D()方法。当纹理是普通图像文件（PNG、GIF、JPEG）时，则它通常可以接受一个HTML DOM类型 Image对象。
  ```javascript
    function initTextures(){
        texture = gl.createTexture(); 
        var image = new Image();
        image.onload = function(){
            loadTexture(image,texture)
        }
        image.src = '/assets/image/blog/webgl/sky.jpg';
    }
    function loadTexture(image,texture){
        var u_Sampler = gl.getUniformLocation(prg, 'u_Sampler');
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
        // 激活纹理单元0
         gl.activeTexture(gl.TEXTURE0);
        // 绑定纹理对象
        gl.bindTexture(gl.TEXTURE_2D, texture);
        // 设置纹理参数
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        // 设置纹理图片数据
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
        // 指定纹理单元
        gl.uniform1i(u_Sampler, 0);
        //解绑纹理
        gl.bindTexture(gl.TEXTURE_2D, null);
    }
  ```
**纹理必须是2的n次方**
在学习如何载入图像数据时，必须知道图像可接受的大小。开发人员经常选择宽度与高度都是2的n次方的图像（即图像的宽度与高度为1、2、4、8、16、32、64、128等值）。另一种表示法是2^m X 2^n的格式，这里的m与n都非负的整数。
采用这种方法的理由之一是老式的GPU只支持纹理宽度与高度都是2的n次方。桌面OpenGL2.0及之后的版本实际上可以支持非2的n次（NPOT）的纹理。在OpenGL ES 2.0和WebGL中，允许使用NPOT纹理，但是存在以下限制：
* 如果使用NPOT纹理，则不能使用Mip映射贴图。
* 唯一允许使用的重复模式是gl.CLAMP_TO_EDGE。

### 将纹理上传到GPU
为了将纹理上传到GPU，需要调用gl.texImage2D()方法。
```javascript
  gl.texImage2D(target, level, internalformat, format, type, image);
```
---
```
  target
      纹理类型，值为gl.TEXTURE_2D或者gl.TEXTURE_CUBE_MAP
  level
      传入0，该参数是为金字塔纹理准备的，一般不用这个参数
  internalformat
      图像的内部格式，必须与format取值相同
  format
      图像的外部格式，根据图像格式来定jpg/bmp用gl.RGB、png用gl.RGBA、灰度图用gl.LUMINANCE或gl.LUMINANCE_ALPHA，此外还有gl.ALPHA
  type
      纹理数据的类型，通常使用gl.UNSIGNED_BYTE，可选值还有gl.UNSIGNED_SHORT_5_6_5、gl.UNSIGNED_SHORT_4_4_4_4、gl.UNSIGNED_SHORT_5_5_5_1
  image
      包含纹理图像的image对象

```

 ![纹理参数与纹素格式](/assets/image/blog/webgl/texture-dataformat.png)

## 定义纹理参数
通过控制纹理参数，可以很好的提升模型的渲染质量。
纹理参数可以分为两大种类：
* 第一种，是和质量或者叫品质相关的参数，改变这个参数的话，渲染的过滤方式会发生变化，所以采用完美补间的纹理，就可能会得到高质量的渲染效果了。
* 第二种，就是纹理的特征了。具体一点来说，通常指定了超出范围的纹理坐标的话，纹理是会发生变化的。一般来说，纹理坐标的范围应该设定在0-1之间，而实际上，即使指定了范围外的纹理坐标也是可以进行渲染的。但是，如果指定了纹理参数，那么这个范围外的值，也就决定了具体的含义。
设置纹理参数，通过gl.texParameteri()方法来设置。需要重点注意的是，这里设定的纹理参数只是针对在这个时间点所绑定的纹理，而WebGL中的的其他纹理是不受影响的。
gl.texParameteri()，第一个参数是纹理的种类，是个常量，通常使用2维的纹理时使用和之前一直在使用的gl.TEXTURE_2D。第二个参数指定纹理参数的种类，第三个参数是个常量。

### 指定纹理的质量
指定纹理的质量，也就是品质，具体就是指纹理伸缩时指定以哪种方式来进行。WebGL中的放大和缩小的处理，是可以分别来设定的。
指定纹理放大时的补间方法时，texParameteri的第二个参数指定为gl.TEXTURE_MAG_FILTER，指定纹理缩小时的补间方法时，参数指定为gl.TEXTURE_MIN_FILTER。而可以利用的质量参数分别在下面的表格中列出了，需要注意的是，MAG_FILTER和MIN_FILTER可以指定的参数常量是不同的。

常量名 | 说明 | MIN | MAG
gl.NEAREST|  最临近过滤，获得最靠近纹理坐标点的像素 | ○ | ○
gl.LINEAR |线性插值过滤，获取坐标点附近4个像素的加权平均值 | ○ | ○
gl.NEAREST_MIPMAP_NEAREST|选择最邻近的mip层，并使用最邻近过滤 | ○ | ×
gl.NEAREST_MIPMAP_LINEAR | 在mip层之间使用线性插值和最邻近过滤 | ○ | ×
gl.LINEAR_MIPMAP_NEAREST | 选择最邻近的mip层，使用线性过滤 | ○ | ×
gl.LINEAR_MIPMAP_LINEAR | 在mip层之间使用线性插值和使用线性过滤 | ○ | ×

使用MIPMAP的时候，只能是图片缩小表示时，指定的常量就是上面那些。而放大的时候，只能根据加权平均来进行补间处理。
上面列举的六个质量参数，越往下，处理负荷越高。通过名字的含义也可以看得出来吧，LINEAR系列要比NEAREST系列负荷大，也能得到相对高质量的效果。如果想要在放大及缩小时都使用最低负荷的处理的话，像下面这样设定就可以了。
```javascript
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);  
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);  
```
### 指定纹理的特征
给纹理设定范围之外的纹理坐标时的情况，这个设定也使用和刚才同样的函数texPrameteri，第二个参数可以指定为两个类型，分别是纹理坐标的横轴和纵轴。
设定纹理的横坐标时用gl.TEXTURE_WRAP_S，设定纵坐标时用gl.TEXTURE_WRAP_T。
而下一个参数可以设定的值有一下三种。

常量名 | 说明 | 例
gl.REPEAT | 范围外的值进行重复处理 | 1.25 = 0.25 : -0.25 = 0.75
gl.MIRRORED_REPEAT | 范围外的值进行镜像重复处理 | 1.25 = 0.75 : -0.25 = 0.25
gl.CLAMP_TO_EDGE | 将值控制在0-1之间 | 1.25 = 1.00 : -0.25 = 0.00

用语言来表述的话，可能不太好理解，gl.REPEAT就是将图片一个接一个的平铺。gl.MIRRORED_REPEAT是像镜子一样翻转之后进行平铺，最后的gl.CLAMP_TO_EDGE就是将纹理坐标控制在0-1的范围内，无论是10，还是100，最后都只能是1。

```javascript
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);  
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);  
```
## 定义纹理坐标
设置纹理坐标，与定顶点颜色坐标类似。WebGL并不知道缓存中的内容是颜色、纹理坐标还是其它数据。它只知道缓存中包含数据。可以看出，将纹理坐标保存在名为verticesTexCoords的数组中，然后把它上传到WebGLBuffer对象。

```javascript
  function initBuffers() {
        /**
        V0 --------V2
        |           |
        |           |
        |           |
        v1---------V3
        */
        var verticesTexCoords = new Float32Array([
            //顶点坐标, 纹理坐标
            -0.5,  0.5,   0.0, 1.0,
            -0.5, -0.5,   0.0, 0.0,
             0.5,  0.5,   1.0, 1.0,
             0.5, -0.5,   1.0, 0.0,
        ]);

        vertexTexCoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexTexCoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, verticesTexCoords, gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, null);
    }
```
