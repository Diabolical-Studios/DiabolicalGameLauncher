import React, {useEffect, useRef} from "react";

const BackgroundAnimation = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        // Function to set canvas size
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        resizeCanvas();

        // Update canvas size on window resize
        window.addEventListener("resize", resizeCanvas);

        // Simplex noise module
        const noise = (function (global) {
            var module = {};

            function Grad(x, y, z) {
                this.x = x;
                this.y = y;
                this.z = z;
            }

            Grad.prototype.dot3 = function (x, y, z) {
                return this.x * x + this.y * y + this.z * z;
            };

            var grad3 = [new Grad(1, 1, 0), new Grad(-1, 1, 0), new Grad(1, -1, 0), new Grad(-1, -1, 0), new Grad(1, 0, 1), new Grad(-1, 0, 1), new Grad(1, 0, -1), new Grad(-1, 0, -1), new Grad(0, 1, 1), new Grad(0, -1, 1), new Grad(0, 1, -1), new Grad(0, -1, -1),];

            var perm = new Array(512);
            var gradP = new Array(512);

            module.seed = function (seed) {
                if (seed > 0 && seed < 1) seed *= 65536;
                seed = Math.floor(seed);
                if (seed < 256) seed |= seed << 8;

                for (var i = 0; i < 256; i++) {
                    var v;
                    if (i & 1) {
                        v = i ^ (seed & 255);
                    } else {
                        v = i ^ ((seed >> 8) & 255);
                    }
                    perm[i] = perm[i + 256] = v;
                    gradP[i] = gradP[i + 256] = grad3[v % 12];
                }
            };
            module.seed(0);

            var F3 = 1 / 3;
            var G3 = 1 / 6;

            module.simplex3 = function (xin, yin, zin) {
                var n0, n1, n2, n3;
                var s = (xin + yin + zin) * F3;
                var i = Math.floor(xin + s);
                var j = Math.floor(yin + s);
                var k = Math.floor(zin + s);

                var t = (i + j + k) * G3;
                var x0 = xin - i + t;
                var y0 = yin - j + t;
                var z0 = zin - k + t;

                var i1, j1, k1;
                var i2, j2, k2;
                if (x0 >= y0) {
                    if (y0 >= z0) {
                        i1 = 1;
                        j1 = 0;
                        k1 = 0;
                        i2 = 1;
                        j2 = 1;
                        k2 = 0;
                    } else if (x0 >= z0) {
                        i1 = 1;
                        j1 = 0;
                        k1 = 0;
                        i2 = 1;
                        j2 = 0;
                        k2 = 1;
                    } else {
                        i1 = 0;
                        j1 = 0;
                        k1 = 1;
                        i2 = 1;
                        j2 = 0;
                        k2 = 1;
                    }
                } else {
                    if (y0 < z0) {
                        i1 = 0;
                        j1 = 0;
                        k1 = 1;
                        i2 = 0;
                        j2 = 1;
                        k2 = 1;
                    } else if (x0 < z0) {
                        i1 = 0;
                        j1 = 1;
                        k1 = 0;
                        i2 = 0;
                        j2 = 1;
                        k2 = 1;
                    } else {
                        i1 = 0;
                        j1 = 1;
                        k1 = 0;
                        i2 = 1;
                        j2 = 1;
                        k2 = 0;
                    }
                }

                var x1 = x0 - i1 + G3;
                var y1 = y0 - j1 + G3;
                var z1 = z0 - k1 + G3;
                var x2 = x0 - i2 + 2 * G3;
                var y2 = y0 - j2 + 2 * G3;
                var z2 = z0 - k2 + 2 * G3;
                var x3 = x0 - 1 + 3 * G3;
                var y3 = y0 - 1 + 3 * G3;
                var z3 = z0 - 1 + 3 * G3;

                i &= 255;
                j &= 255;
                k &= 255;
                var gi0 = gradP[i + perm[j + perm[k]]];
                var gi1 = gradP[i + i1 + perm[j + j1 + perm[k + k1]]];
                var gi2 = gradP[i + i2 + perm[j + j2 + perm[k + k2]]];
                var gi3 = gradP[i + 1 + perm[j + 1 + perm[k + 1]]];

                var t0 = 0.6 - x0 * x0 - y0 * y0 - z0 * z0;
                if (t0 < 0) n0 = 0; else {
                    t0 *= t0;
                    n0 = t0 * t0 * gi0.dot3(x0, y0, z0);
                }

                var t1 = 0.6 - x1 * x1 - y1 * y1 - z1 * z1;
                if (t1 < 0) n1 = 0; else {
                    t1 *= t1;
                    n1 = t1 * t1 * gi1.dot3(x1, y1, z1);
                }

                var t2 = 0.6 - x2 * x2 - y2 * y2 - z2 * z2;
                if (t2 < 0) n2 = 0; else {
                    t2 *= t2;
                    n2 = t2 * t2 * gi2.dot3(x2, y2, z2);
                }

                var t3 = 0.6 - x3 * x3 - y3 * y3 - z3 * z3;
                if (t3 < 0) n3 = 0; else {
                    t3 *= t3;
                    n3 = t3 * t3 * gi3.dot3(x3, y3, z3);
                }

                return 32 * (n0 + n1 + n2 + n3);
            };

            return module;
        })(window);

        noise.seed(Math.random());

        let animationTime = 0;
        let globalHueSeed = Math.random() * 360;
        let lastTime = performance.now();

        function animate() {
            const now = performance.now();
            const deltaTime = (now - lastTime) / 1000;
            lastTime = now;
            animationTime += deltaTime * 0.05;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            for (let x = 0; x < canvas.width; x += 15) {
                for (let y = 0; y < canvas.height; y += 15) {
                    let point = Math.abs(noise.simplex3(x / 900, y / 900, animationTime * 2));
                    const baseHue = globalHueSeed + noise.simplex3(x / 1000, y / 1000, animationTime) * 60;
                    const hueVariation = 80 + noise.simplex3(x / 500, y / 500, animationTime) * 100;
                    const hue = (baseHue + point * hueVariation) % 360;
                    ctx.fillStyle = `hsla(${hue}, 70%, 50%, ${point})`;
                    ctx.beginPath();
                    ctx.arc(x, y, point * 6, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
            requestAnimationFrame(animate);
        }

        animate();

        return () => {
            window.removeEventListener("resize", resizeCanvas);
        };
    }, []);

    return (<canvas
        ref={canvasRef}
        style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            zIndex: -1,
            opacity: 0.5,
            backgroundColor: "#000",
        }}
    />);
};

export default BackgroundAnimation;
