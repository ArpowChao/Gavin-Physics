(function bootstrapPhysicsRuntime(global) {
    'use strict';

    const DEFAULT_THREE_SOURCE = 'assets/lib/three.min.js';
    let threePromise = null;

    class FixedStepClock {
        constructor({ stepHz = 60, maxFrameDelta = 0.25, maxSteps = 12 } = {}) {
            this.fixedDt = 1 / stepHz;
            this.maxFrameDelta = maxFrameDelta;
            this.maxSteps = maxSteps;
            this.accumulator = 0;
            this.lastTimestamp = null;
            this.simulationTime = 0;
        }

        reset(timestamp = null) {
            this.accumulator = 0;
            this.lastTimestamp = timestamp;
            this.simulationTime = 0;
        }

        advance(timestamp, update) {
            if (this.lastTimestamp === null) {
                this.lastTimestamp = timestamp;
                return { steps: 0, alpha: 0, frameDelta: 0 };
            }

            const frameDelta = Math.min(
                Math.max((timestamp - this.lastTimestamp) / 1000, 0),
                this.maxFrameDelta
            );
            this.lastTimestamp = timestamp;
            this.accumulator += frameDelta;

            let steps = 0;
            while (this.accumulator >= this.fixedDt && steps < this.maxSteps) {
                update(this.fixedDt);
                this.simulationTime += this.fixedDt;
                this.accumulator -= this.fixedDt;
                steps += 1;
            }

            if (steps === this.maxSteps && this.accumulator >= this.fixedDt) {
                this.accumulator %= this.fixedDt;
            }

            return {
                steps,
                alpha: this.accumulator / this.fixedDt,
                frameDelta
            };
        }
    }

    function createFixedClock(options) {
        return new FixedStepClock(options);
    }

    function prefersReducedMotion() {
        return Boolean(global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches);
    }

    class DisposerRegistry {
        constructor(label = 'view') {
            this.label = label;
            this.disposers = new Set();
            this.disposed = false;
        }

        add(disposer) {
            if (typeof disposer !== 'function') return () => {};
            if (this.disposed) {
                disposer();
                return () => {};
            }
            this.disposers.add(disposer);
            return () => this.disposers.delete(disposer);
        }

        listen(target, type, listener, options) {
            if (!target || typeof target.addEventListener !== 'function') return () => {};
            target.addEventListener(type, listener, options);
            const dispose = () => target.removeEventListener(type, listener, options);
            this.add(dispose);
            return dispose;
        }

        observe(observer) {
            if (!observer || typeof observer.disconnect !== 'function') return observer;
            this.add(() => observer.disconnect());
            return observer;
        }

        dispose() {
            if (this.disposed) return;
            this.disposed = true;
            const pending = Array.from(this.disposers).reverse();
            this.disposers.clear();
            pending.forEach(disposer => {
                try {
                    disposer();
                } catch (error) {
                    console.warn(`[PhysicsRuntime] Failed to dispose ${this.label} resource.`, error);
                }
            });
        }

        get size() {
            return this.disposers.size;
        }
    }

    function createDisposerRegistry(label) {
        return new DisposerRegistry(label);
    }

    function loadThree(source = DEFAULT_THREE_SOURCE) {
        if (global.THREE) {
            global.__threeReady = true;
            return Promise.resolve(global.THREE);
        }
        if (threePromise) return threePromise;

        global.__threeReady = undefined;
        threePromise = new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = source;
            script.async = true;
            script.dataset.physicsRuntime = 'three';
            script.onload = () => {
                if (!global.THREE) {
                    global.__threeReady = false;
                    reject(new Error('Three.js 載入完成，但找不到 THREE 全域物件。'));
                    return;
                }
                global.__threeReady = true;
                global.dispatchEvent(new Event('three-status'));
                resolve(global.THREE);
            };
            script.onerror = () => {
                global.__threeReady = false;
                threePromise = null;
                global.dispatchEvent(new Event('three-status'));
                reject(new Error(`無法載入 ${source}`));
            };
            document.head.appendChild(script);
        });
        return threePromise;
    }

    function disposeThreeScene(scene, renderer) {
        if (scene) {
            const disposedTextures = new Set();
            const disposedMaterials = new Set();
            const disposedGeometries = new Set();
            scene.traverse(object => {
                if (object.geometry && !disposedGeometries.has(object.geometry)) {
                    object.geometry.dispose();
                    disposedGeometries.add(object.geometry);
                }
                const materials = Array.isArray(object.material) ? object.material : [object.material];
                materials.filter(Boolean).forEach(material => {
                    if (disposedMaterials.has(material)) return;
                    Object.values(material).forEach(value => {
                        if (value && value.isTexture && !disposedTextures.has(value)) {
                            value.dispose();
                            disposedTextures.add(value);
                        }
                    });
                    material.dispose();
                    disposedMaterials.add(material);
                });
            });
        }
        if (renderer) {
            if (renderer.renderLists && renderer.renderLists.dispose) renderer.renderLists.dispose();
            renderer.dispose();
            if (renderer.forceContextLoss) renderer.forceContextLoss();
        }
    }

    global.PhysicsRuntime = Object.freeze({
        FixedStepClock,
        DisposerRegistry,
        createFixedClock,
        createDisposerRegistry,
        prefersReducedMotion,
        loadThree,
        disposeThreeScene
    });
})(window);
