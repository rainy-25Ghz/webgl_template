let canvas = document.getElementById(
    "canvas"
) as HTMLCanvasElement;
let gl = canvas.getContext("webgl2");
function resizeCanvasToDisplaySize(
    canvas: HTMLCanvasElement
) {
    // Lookup the size the browser is displaying the canvas in CSS pixels.
    const displayWidth = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;

    // Check if the canvas is not the same size.
    const needResize =
        canvas.width !== displayWidth ||
        canvas.height !== displayHeight;

    if (needResize) {
        // Make the canvas the same size
        canvas.width = displayWidth;
        canvas.height = displayHeight;
    }

    return needResize;
}
function createShader(
    gl: WebGL2RenderingContext,
    type: number,
    source: string
) {
    let shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    let success = gl.getShaderParameter(
        shader,
        gl.COMPILE_STATUS
    );
    if (success) {
        return shader;
    }

    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
}
function createProgram(
    gl: WebGL2RenderingContext,
    vertexShader: WebGLShader,
    fragmentShader: WebGLShader
) {
    let program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    let success = gl.getProgramParameter(
        program,
        gl.LINK_STATUS
    );
    if (success) {
        return program;
    }

    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
}
let vertexShaderSource = `#version 300 es

// an attribute is an input (in) to a vertex shader.
// It will receive data from a buffer
in vec4 a_position;
in vec4 a_color;

// A matrix to transform the positions by
uniform mat4 u_matrix;

// a varying the color to the fragment shader
out vec4 v_color;

// all shaders have a main function
void main() {
  // Multiply the position by the matrix.
  gl_Position = u_matrix * a_position;

  // Pass the color to the fragment shader.
  v_color = a_color;
}
`;
let fragmentShaderSource = `#version 300 es

precision highp float;

// the varied color passed from the vertex shader
in vec4 v_color;

// we need to declare an output for the fragment shader
out vec4 outColor;

void main() {
  outColor = v_color;
}
`;

let vertexShader = createShader(
    gl,
    gl.VERTEX_SHADER,
    vertexShaderSource
);
let fragmentShader = createShader(
    gl,
    gl.FRAGMENT_SHADER,
    fragmentShaderSource
);
let program = createProgram(
    gl,
    vertexShader,
    fragmentShader
);

//找属性attribute与uniform在buffer中的位置
// look up where the vertex data needs to go.
let positionAttributeLocation = gl.getAttribLocation(
    program,
    "a_position"
);

// look up uniform locations
let colorLocation = gl.getUniformLocation(
    program,
    "u_color"
);
let matrixLocation = gl.getUniformLocation(
    program,
    "u_matrix"
);

// Create a buffer
let positionBuffer = gl.createBuffer();

// Create a vertex array object (attribute state)
let vao = gl.createVertexArray();

// and make it the one we're currently working with
gl.bindVertexArray(vao);

// Turn on the attribute
gl.enableVertexAttribArray(positionAttributeLocation);

// Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

//设置几何数据
gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([
        // left column
        0, 0, 0, 30, 0, 0, 0, 150, 0, 0, 150, 0, 30, 0, 0,
        30, 150, 0,

        // top rung
        30, 0, 0, 100, 0, 0, 30, 30, 0, 30, 30, 0, 100, 0,
        0, 100, 30, 0,

        // middle rung
        30, 60, 0, 67, 60, 0, 30, 90, 0, 30, 90, 0, 67, 60,
        0, 67, 90, 0,
    ]),
    gl.STATIC_DRAW
);

let m4 = {
    projection: function (width, height, depth) {
        // Note: This matrix flips the Y axis so 0 is at the top.
        return [
            2 / width,
            0,
            0,
            0,
            0,
            -2 / height,
            0,
            0,
            0,
            0,
            2 / depth,
            0,
            -1,
            1,
            0,
            1,
        ];
    },

    multiply: function (a: number[], b: number[]) {
        let a00 = a[0 * 4 + 0];
        let a01 = a[0 * 4 + 1];
        let a02 = a[0 * 4 + 2];
        let a03 = a[0 * 4 + 3];
        let a10 = a[1 * 4 + 0];
        let a11 = a[1 * 4 + 1];
        let a12 = a[1 * 4 + 2];
        let a13 = a[1 * 4 + 3];
        let a20 = a[2 * 4 + 0];
        let a21 = a[2 * 4 + 1];
        let a22 = a[2 * 4 + 2];
        let a23 = a[2 * 4 + 3];
        let a30 = a[3 * 4 + 0];
        let a31 = a[3 * 4 + 1];
        let a32 = a[3 * 4 + 2];
        let a33 = a[3 * 4 + 3];
        let b00 = b[0 * 4 + 0];
        let b01 = b[0 * 4 + 1];
        let b02 = b[0 * 4 + 2];
        let b03 = b[0 * 4 + 3];
        let b10 = b[1 * 4 + 0];
        let b11 = b[1 * 4 + 1];
        let b12 = b[1 * 4 + 2];
        let b13 = b[1 * 4 + 3];
        let b20 = b[2 * 4 + 0];
        let b21 = b[2 * 4 + 1];
        let b22 = b[2 * 4 + 2];
        let b23 = b[2 * 4 + 3];
        let b30 = b[3 * 4 + 0];
        let b31 = b[3 * 4 + 1];
        let b32 = b[3 * 4 + 2];
        let b33 = b[3 * 4 + 3];
        return [
            b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30,
            b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31,
            b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32,
            b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33,
            b10 * a00 + b11 * a10 + b12 * a20 + b13 * a30,
            b10 * a01 + b11 * a11 + b12 * a21 + b13 * a31,
            b10 * a02 + b11 * a12 + b12 * a22 + b13 * a32,
            b10 * a03 + b11 * a13 + b12 * a23 + b13 * a33,
            b20 * a00 + b21 * a10 + b22 * a20 + b23 * a30,
            b20 * a01 + b21 * a11 + b22 * a21 + b23 * a31,
            b20 * a02 + b21 * a12 + b22 * a22 + b23 * a32,
            b20 * a03 + b21 * a13 + b22 * a23 + b23 * a33,
            b30 * a00 + b31 * a10 + b32 * a20 + b33 * a30,
            b30 * a01 + b31 * a11 + b32 * a21 + b33 * a31,
            b30 * a02 + b31 * a12 + b32 * a22 + b33 * a32,
            b30 * a03 + b31 * a13 + b32 * a23 + b33 * a33,
        ];
    },

    translation: function (
        tx: number,
        ty: number,
        tz: number
    ) {
        return [
            1,
            0,
            0,
            0,
            0,
            1,
            0,
            0,
            0,
            0,
            1,
            0,
            tx,
            ty,
            tz,
            1,
        ];
    },

    xRotation: function (angleInRadians: number) {
        let c = Math.cos(angleInRadians);
        let s = Math.sin(angleInRadians);

        return [
            1,
            0,
            0,
            0,
            0,
            c,
            s,
            0,
            0,
            -s,
            c,
            0,
            0,
            0,
            0,
            1,
        ];
    },

    yRotation: function (angleInRadians: number) {
        let c = Math.cos(angleInRadians);
        let s = Math.sin(angleInRadians);

        return [
            c,
            0,
            -s,
            0,
            0,
            1,
            0,
            0,
            s,
            0,
            c,
            0,
            0,
            0,
            0,
            1,
        ];
    },

    zRotation: function (angleInRadians: number) {
        let c = Math.cos(angleInRadians);
        let s = Math.sin(angleInRadians);

        return [
            c,
            s,
            0,
            0,
            -s,
            c,
            0,
            0,
            0,
            0,
            1,
            0,
            0,
            0,
            0,
            1,
        ];
    },

    scaling: function (sx: number, sy: number, sz: number) {
        return [
            sx,
            0,
            0,
            0,
            0,
            sy,
            0,
            0,
            0,
            0,
            sz,
            0,
            0,
            0,
            0,
            1,
        ];
    },

    translate: function (
        m: number[],
        tx: number,
        ty: number,
        tz: number
    ) {
        return m4.multiply(m, m4.translation(tx, ty, tz));
    },

    xRotate: function (
        m: number[],
        angleInRadians: number
    ) {
        return m4.multiply(m, m4.xRotation(angleInRadians));
    },

    yRotate: function (
        m: number[],
        angleInRadians: number
    ) {
        return m4.multiply(m, m4.yRotation(angleInRadians));
    },

    zRotate: function (
        m: number[],
        angleInRadians: number
    ) {
        return m4.multiply(m, m4.zRotation(angleInRadians));
    },

    scale: function (
        m: number[],
        sx: number,
        sy: number,
        sz: number
    ) {
        return m4.multiply(m, m4.scaling(sx, sy, sz));
    },
};

// Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
let size = 3; // 3 components per iteration
let type = gl.FLOAT; // the data is 32bit floats
let normalize = false; // don't normalize the data
let stride = 0; // 0 = move forward size * sizeof(type) each iteration to get the next position
let offset = 0; // start at the beginning of the buffer
gl.vertexAttribPointer(
    positionAttributeLocation,
    size,
    type,
    normalize,
    stride,
    offset
);
function radToDeg(r) {
    return (r * 180) / Math.PI;
}

function degToRad(d) {
    return (d * Math.PI) / 180;
}

 // First let's make some variables
  // to hold the translation,
  let translation = [45, 150, 0];
  let rotation = [degToRad(40), degToRad(25), degToRad(325)];
  let scale = [1, 1, 1];
  let color = [Math.random(), Math.random(), Math.random(), 1];

  function drawScene(){
      // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // Clear the canvas
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Tell it to use our program (pair of shaders)
    gl.useProgram(program);

    // Bind the attribute/buffer set we want.
    gl.bindVertexArray(vao);

    // Set the color.
    gl.uniform4fv(colorLocation, color);

    // Compute the matrix
    let matrix = m4.projection(gl.canvas.clientWidth, gl.canvas.clientHeight, 400);
    matrix = m4.translate(matrix, translation[0], translation[1], translation[2]);
    matrix = m4.xRotate(matrix, rotation[0]);
    matrix = m4.yRotate(matrix, rotation[1]);
    matrix = m4.zRotate(matrix, rotation[2]);
    matrix = m4.scale(matrix, scale[0], scale[1], scale[2]);

    // Set the matrix.
    gl.uniformMatrix4fv(matrixLocation, false, matrix);

    // Draw the geometry.
    let primitiveType = gl.TRIANGLES;
    let offset = 0;
    let count = 18;
    gl.drawArrays(primitiveType, offset, count);
  }

  drawScene()