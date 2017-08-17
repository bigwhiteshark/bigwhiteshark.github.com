---
title: WebGL中的光照
date: 2017-08-09 18:00
tags: [webgl, light]
---

## 本节内容

明暗、阴影、不同光的类型：点光源、平行光和散射光。
物体表面反射光线的方式：漫反射和环境反射。
编写代码实现光照效果。

## 光照原理

现实世界中的物体被光线照射时，会反射一部分光，只有反射光线进入你的眼睛时，你才能够看到物体并辨认出它的颜色。白色物体反射白光，白光进入你的眼睛时，才能看到物体是白色的。

现实世界中，当光线照到物体上时，发生两个重要的现象：
* 根据光源和光线方向，物体不同表面的明暗程度变得不一致。
* 根据光源和光线方向，物体向地面投下了影子。

在生活中常常会注意到阴影，却很少注意明暗差异。实际上明暗差异给了物体立体感，虽然难以察觉，但它始终存在。

在三维图形学中术语 **着色**(shading) 的真正含义就是，根据光照条件重建“物体各表面明暗不一致的效果”的过程。物体向地面投下影子的现象，又被称为 **阴影** (shadowing)。

在讨论着色过程之前，考虑两件事情：
* 发出光线的光源类型。
* 物体表面如何反射光线。 

##### 光源类型：

* 平行光：平行光的光线是相互平行的，具有方向性。类似于自然中的太阳光。可以用一个方向和一个颜色来定义。
* 点光源：从一个点向周围的所有方向发现的光，类似于人造的灯泡的光，如灯泡、火焰。
* 环境光：也叫间接光，真实世界中非直射光，是指哪些经光源（点或平行光源）发出后，被墙壁等物体多次反射，然后照到物体表面上的光，环境光从各个角度照射物体，其强度都是一致的。不用指定位置与方向，只需要指定颜色即可。
* 聚光灯光：模拟电筒、车前灯，探照灯等。

##### 反射类型：

* 漫反射：针对平行光或点光源而言的。漫反射的反射光在各个方向上是均匀的。大部分物体表面是粗糙的，如纸张、岩石、塑料等，在这种情况下反射光就会以不固定的角度反射出去。漫反射就是针对后一种情况而建立的理想反射模型 。

  ![漫反射](/assets/image/blog/diffuse.png)

  漫反射中，反射光的颜色取决于入射光的颜色、表面的基底色、入射与表面形成的入射角。将入射角定义为入射光与法线形成的夹角，并用θ表示，那么漫反射光的颜色可以根据下式得到：

  ![漫反射公式](/assets/image/blog/diffuse-formula.png)

因为漫反射光在各个方向上都是“均匀”的，所以从任何角度上看去其强度都相等，如下

![漫反射光方向](/assets/image/blog/diffuse-directionpng.png)

* 环境反射：针对环境光而言。反射光的方向可以认为就是入射光的方向。由于环境光照射物体的方式就是各方向均匀、强度相等的，所以反射光也是各方向均匀。

  ![环境反射公式](/assets/image/blog/ambient-formula.png)

  这里的入射光实际上也就是环境光的颜色。

  ![环境光方向](/assets/image/blog/ambient-direction.png)

  当漫反射和环境反射同时存在时，将两者加起来，就会得到物体最终被观察到的颜色：

  ![物体最终颜色](/assets/image/blog/material-color.png)

  ## 平行光下的漫反射

  漫反射的反射光，其颜色与入射光在入射点的入射角θ有关。平行光入射产生的漫反射的颜色很容易计算。因为平行光的方向是唯一的，对于同一平面上的所有点，入射角是相同的。根据上面的公式来计算漫反射光的颜色：

  ![漫反射公式](/assets/image/blog/diffuse-formula.png)

  用到三项数据：

  * 平行入射光的颜色
  * 表面的基底色（物体的颜色）
  * 入射光与表面形成的入射角θ

  计算反射光颜色时，我们要对RGB值的三个分量逐个相乘。

  根据光线和表面的方向计算入射角。通过计算两个矢量的点积，来计算这两个矢量的夹角余弦值cosθ。点积的计算公升：

  ![点积](/assets/image/blog/dot.png)

  ```
  其中，||符号是表示矢量的长度。如果两个矢量的长度都是1.0，那么点积的结果就是cosθ值。如果n为（nx,ny,nz）,l为（lx,ly,lz）,那么 n·l= nx * lx + ny * ly + nz * lz。该公式可由余弦定理得到。
  ```

  ![反射光公式2](/assets/image/blog/diffuse-format-2.png)

  注意，其一光线方向矢量与表面法线矢量长度必须为1，否则反射光的颜色就会过暗或过亮。将一个矢量长度调整为1，同时保持方向不变的过程称之为 **归一化**（normalization）。

  “光线方向”，实际就是入射方向的反方向。

  ![光线方向](/assets/image/blog/light-direction.png)

#### 法线(表面的朝向)

 物体的表面的朝向。即垂直于表面的方向，又称法线或法向量。法向量有三个分量.向量（nx,ny,nz）表示从原点（0,0,0）指向点（nx,ny,nz）的方向。比如说向量（1,0,0）表示X轴正方向，向量（0,0,1）表示Z轴正方向。
另外，一个表面具有两个法向量。每个表面都有两个面，“正面”和“背面”。两个面各自都有一个法向量。
​    
![法线方向](/assets/image/blog/normal.png)

#### 平面的法向量唯一
法向量表示的是方向，与位置无关。所以一个平面只有一个法向量。换句话说，平面的任意一点都具有相同的法向量。

![法线方向](/assets/image/blog/normal-position.png)

一旦计算好每个平面的法线向量，接下来的任务将数据传给着色器程序。

## 示例程序
##### 平行光下的漫反射

示例程序1：[LightedCube.html](/examples/webgl/light/LightedCube.html)。下面重点看一下着色器部分代码：

顶点着色器代码：
```glsl
        attribute vec4 a_Position; 
        attribute vec4 a_Color; 
        attribute vec4 a_Normal;
    
         uniform mat4 u_MvpMatrix; 
         uniform vec3 u_LightColor; 
         uniform vec3 u_LightDirection; 
    
         varying vec4 v_Color; 
         void main(){ 
            gl_Position = u_MvpMatrix * a_Position; 
            // 对法向量进行归一化
            vec3 normal = normalize(a_Normal.xyz); 
            // 计算光线方向和法向量的点积
            float nDotL = max(dot(u_LightDirection,normal),0.0); 
            // 计算漫反射光的颜色
            vec3 diffuse = u_LightColor * a_Color.rgb * nDotL; 
            v_Color = vec4(diffuse,a_Color.a); 
        }
```
对法向量进行归一化
```glsl
        // 对法向量进行归一化
        vec3 normal = normalize(a_Normal.xyz); 
```
由于a_Normal变量是vec4类型的，使用前三个分量x、y、z表示法线方向，所以将这三个分量提取出来进行归一化。
接下来计算点积，光线方向·法线方向。光线方向存在u_LightDirection变量中，已被归一化。

            // 计算光线方向和法向量的点积
            float nDotL = max(dot(u_LightDirection,normal),0.0); 

点积小于0，意味着cosθ中的θ大于90度。θ是入射角，也就是入射反方向（光线方向）与表面法线向量的夹角，θ大于90度说明光线照射在表面的背面，如下所示

  ![光线角度](/assets/image/blog/light-angle.png)

最后根据公式，计算出漫反射光的颜色。
```glsl
            // 计算漫反射光的颜色
            vec3 diffuse = u_LightColor * a_Color.rgb * nDotL; 
            v_Color = vec4(diffuse,a_Color.a); 
```
v_Color变量将被传入片元着色器并赋值给gl_FragColor变量。

片元着色器代码：

```glsl
      #ifdef GL_ES 
      precision mediump float; 
      #endif 
  
      varying vec4 v_Color; 
      void main(){ 
        gl_FragColor = v_Color;
      }
```

##### 环境光下的漫反射
因为环境光均匀地从各个角度照在物体表面，所以由环境光反射产生的颜色只取决于光的颜色和表面基底色。

示例程序2：[LightedCube_ambient.html](/examples/webgl/light/LightedCube_ambient.html)。下面重点看一下着色器部分代码：
顶点着色器代码：

```glsl
      attribute vec4 a_Position; 
      attribute vec4 a_Color; 
      attribute vec4 a_Normal;

       uniform mat4 u_MvpMatrix; 
       uniform vec3 u_DiffuseLight;

       uniform vec3 u_LightDirection;
       uniform vec3 u_AmbientLight; 

       varying vec4 v_Color; 

       void main(){ 
        gl_Position = u_MvpMatrix * a_Position; 
        vec3 normal = normalize(a_Normal.xyz); 
        float nDotL = max(dot(u_LightDirection,normal),0.0); 
        vec3 diffuse = u_DiffuseLight * a_Color.rgb * nDotL; 
        vec3 ambient = u_AmbientLight * a_Color.rgb;
        v_Color = vec4(diffuse + ambient, a_Color.a);
      }
```

