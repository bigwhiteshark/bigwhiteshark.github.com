/* global glUtil, document */

;(function() {
    document.addEventListener('DOMContentLoaded', function() {
        //---webgl
        var webgl = document.getElementById('webgl');
        var gl = glUtil.getContext(webgl);
        glUtil.debug(true); // log error
        if (!gl) {
            return;
        }

        // 指定清空canvas的颜色
        // 参数是rgba，范围0.0~1.0
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        // 清空canvas
        // gl.COLOR_BUFFER_BIT颜色缓存，默认清空色rgba(0.0, 0.0, 0.0, 0.0) 透明黑色，通过gl.clearColor指定
        // gl.DEPTH_BUFFER_BIT深度缓存，默认深度1.0，通过gl.clearDepth指定
        // gl.STENCIL_BUFFER_BIT模板缓存，默认值0，通过gl.clearStencil()指定
        gl.clear(gl.COLOR_BUFFER_BIT);
        
        // 在指定位置绘制点
        // 0.着色器源程序
        // 顶点着色器源程序
        var vsSrc = 'attribute vec4 a_Position;' +
            'attribute vec2 a_TexCoord;' +  // 接受纹理坐标
            'varying vec2 v_TexCoord;' +    // 传递纹理坐标
            'void main() {' +
            'gl_Position = a_Position;' +   // 设置坐标
            'v_TexCoord = a_TexCoord;' +    // 设置纹理坐标
        '}';
        // 片元着色器源程序
        //!!! 需要声明浮点数精度，否则报错No precision specified for (float) 
        var fsSrc = 'precision mediump float;' +
            'uniform sampler2D u_Sampler;' +    // 取样器
            'varying vec2 v_TexCoord;' +        // 接受纹理坐标
            'void main() {' +
            'gl_FragColor = texture2D(u_Sampler, v_TexCoord);' + // 设置颜色
        '}';
        // 1.初始化着色器
        glUtil.initShaders(vsSrc, fsSrc);
        // 2.给attribute变量赋值
        // 获取attribute变量的存储位置
        var a_Position = gl.getAttribLocation(glUtil.program, 'a_Position');
        if (a_Position < 0) {
            console.log('Failed to get the storage location of a_Position');
            return;
        }
        var a_TexCoord = gl.getAttribLocation(glUtil.program, 'a_TexCoord');
        if (a_TexCoord < 0) {
            console.log('Failed to get the storage location of a_TexCoord');
            return;
        }
        var arrVtx = new Float32Array([
            // x, y, s, t
            // -0.5, 0.5, 0.0, 1.0,
            // 0.5, 0.5, 1.0, 1.0,
            // -0.5, -0.5, 0.0, 0.0,
            // 0.5, -0.5, 1.0, 0.0

            // 平铺九宫格
            // -0.5, 0.5, -1.0, 2.0,
            // 0.5, 0.5, 2.0, 2.0,
            // -0.5, -0.5, -1.0, -1.0,
            // 0.5, -0.5, 2.0, -1.0
            
            // 水平平铺2个
            -0.5, 0.5, 0.0, 1.0,
            0.5, 0.5, 2.0, 1.0,
            -0.5, -0.5, 0.0, 0.0,
            0.5, -0.5, 2.0, 0.0
        ]);
        // 1.创建buffer
        var vBuffer = gl.createBuffer();
        if (!vBuffer) {
            console.log('Failed to create buffer');
            return;
        }
        // 2.把缓冲区对象绑定到目标
        gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
        // 3.向缓冲区对象写入数据
        gl.bufferData(gl.ARRAY_BUFFER, arrVtx, gl.STATIC_DRAW);
        // 4.将缓冲区对象分配给a_Position变量、a_Color变量
        var size = arrVtx.BYTES_PER_ELEMENT;
        gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, size * 4, 0);
        gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, size * 4, size * 2);
        //!!! 注意：分配完还要enable连接
        // 5.连接a_Position、a_TexCoord变量和分配给它的缓冲区对象
        gl.enableVertexAttribArray(a_Position);
        gl.enableVertexAttribArray(a_TexCoord);

        // 给uniform变量赋值
        var u_Sampler = gl.getUniformLocation(glUtil.program, 'u_Sampler');
        // 创建texture
        var texture = gl.createTexture();   // 创建纹理对象
        var image = new Image();
        image.onload = function() {
            //---加载纹理
            // 1.对纹理图像进行y轴反转
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
            // 2.开开启0号纹理单元
            gl.activeTexture(gl.TEXTURE0);
            // 3.向target绑定纹理对象
            gl.bindTexture(gl.TEXTURE_2D, texture);
            // 4.配置纹理参数
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            // 用图片边缘颜色填充空白区域
            // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            // 镜像填充（轴对称）
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
            // 5.配置纹理图像
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
            // 6.将0号纹理传递给着色器
            gl.uniform1i(u_Sampler, 0);

            // 绘制矩形
            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, arrVtx.length / 4);
        };
        // image.src = 'miao.jpg';
        // miao.jpg报错
        // WebGL: drawArrays: texture bound to texture unit 0 is not renderable. It maybe non-power-of-2 and have incompatible texture filtering or is not 'texture complete'. Or the texture is Float or Half Float type with linear filtering while OES_float_linear or OES_half_float_linear extension is not enabled.
        // image.src = 'miao256.jpg';
        // image.src = 'miao128.jpg';
        image.src = 'miao256x128.png';
    });
})();