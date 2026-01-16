import { Camera, Mesh, Plane, Program, Renderer, Texture, Transform } from 'ogl';
import { useEffect, useRef, lazy, Suspense } from 'react';

function debounce(func, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

function lerp(p1, p2, t) {
  return p1 + (p2 - p1) * t;
}

function autoBind(instance) {
  const proto = Object.getPrototypeOf(instance);
  Object.getOwnPropertyNames(proto).forEach(key => {
    if (key !== 'constructor' && typeof instance[key] === 'function') {
      instance[key] = instance[key].bind(instance);
    }
  });
}

function createTextTexture(gl, text, font = 'bold 30px monospace', color = 'black') {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  context.font = font;
  const metrics = context.measureText(text);
  const textWidth = Math.ceil(metrics.width);
  const textHeight = Math.ceil(parseInt(font, 10) * 1.2);
  canvas.width = textWidth + 20;
  canvas.height = textHeight + 20;
  context.font = font;
  context.fillStyle = color;
  context.textBaseline = 'middle';
  context.textAlign = 'center';
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillText(text, canvas.width / 2, canvas.height / 2);
  const texture = new Texture(gl, { generateMipmaps: false });
  texture.image = canvas;
  return { texture, width: canvas.width, height: canvas.height };
}

class Title {
  constructor({ gl, plane, renderer, text, textColor = '#545050', font = '30px sans-serif' }) {
    autoBind(this);
    this.gl = gl;
    this.plane = plane;
    this.renderer = renderer;
    this.text = text;
    this.textColor = textColor;
    this.font = font;
    this.createMesh();
  }

  createMesh() {
    const { texture, width, height } = createTextTexture(this.gl, this.text, this.font, this.textColor);
    const geometry = new Plane(this.gl);
    const program = new Program(this.gl, {
      vertex: `
        attribute vec3 position;
        attribute vec2 uv;
        uniform mat4 modelViewMatrix;
        uniform mat4 projectionMatrix;
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragment: `
        precision highp float;
        uniform sampler2D tMap;
        varying vec2 vUv;
        void main() {
          vec4 color = texture2D(tMap, vUv);
          if (color.a < 0.1) discard;
          gl_FragColor = color;
        }
      `,
      uniforms: { tMap: { value: texture } },
      transparent: true
    });
    this.mesh = new Mesh(this.gl, { geometry, program });
    const aspect = width / height;
    const textHeight = this.plane.scale.y * 0.15;
    const textWidth = textHeight * aspect;
    this.mesh.scale.set(textWidth, textHeight, 1);
    this.mesh.position.y = -this.plane.scale.y * 0.5 - textHeight * 0.5 - 0.05;
    this.mesh.setParent(this.plane);
  }
}

class Media {
  constructor({
    geometry,
    gl,
    image,
    index,
    length,
    renderer,
    scene,
    screen,
    text,
    viewport,
    bend,
    textColor,
    borderRadius = 0,
    font,
    route,
    onItemClick
  }) {
    this.extra = 0;
    this.geometry = geometry;
    this.gl = gl;
    this.image = image;
    this.index = index;
    this.length = length;
    this.renderer = renderer;
    this.scene = scene;
    this.screen = screen;
    this.text = text;
    this.viewport = viewport;
    this.bend = bend;
    this.textColor = textColor;
    this.borderRadius = borderRadius;
    this.font = font;
    this.route = route;
    this.onItemClick = onItemClick;
    this.createShader();
    this.createMesh();
    this.createTitle();
    this.onResize();
  }

  createShader() {
    const texture = new Texture(this.gl, { generateMipmaps: true });
    this.program = new Program(this.gl, {
      depthTest: false,
      depthWrite: false,
      vertex: `
        precision highp float;
        attribute vec3 position;
        attribute vec2 uv;
        uniform mat4 modelViewMatrix;
        uniform mat4 projectionMatrix;
        uniform float uTime;
        uniform float uSpeed;
        varying vec2 vUv;
        void main() {
          vUv = uv;
          vec3 p = position;
          p.z = (sin(p.x * 4.0 + uTime) * 1.5 + cos(p.y * 2.0 + uTime) * 1.5) * (0.1 + uSpeed * 0.5);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        }
      `,
      fragment: `
        precision highp float;
        uniform vec2 uImageSizes;
        uniform vec2 uPlaneSizes;
        uniform sampler2D tMap;
        uniform float uBorderRadius;
        varying vec2 vUv;
        
        float roundedBoxSDF(vec2 p, vec2 b, float r) {
          vec2 d = abs(p) - b;
          return length(max(d, vec2(0.0))) + min(max(d.x, d.y), 0.0) - r;
        }
        
        void main() {
          vec2 ratio = vec2(
            min((uPlaneSizes.x / uPlaneSizes.y) / (uImageSizes.x / uImageSizes.y), 1.0),
            min((uPlaneSizes.y / uPlaneSizes.x) / (uImageSizes.y / uImageSizes.x), 1.0)
          );
          vec2 uv = vec2(
            vUv.x * ratio.x + (1.0 - ratio.x) * 0.5,
            vUv.y * ratio.y + (1.0 - ratio.y) * 0.5
          );
          vec4 color = texture2D(tMap, uv);
          float d = roundedBoxSDF(vUv - 0.5, vec2(0.5 - uBorderRadius), uBorderRadius);
          float edgeSmooth = 0.002;
          float alpha = 1.0 - smoothstep(-edgeSmooth, edgeSmooth, d);
          gl_FragColor = vec4(color.rgb, alpha);
        }
      `,
      uniforms: {
        tMap: { value: texture },
        uPlaneSizes: { value: [0, 0] },
        uImageSizes: { value: [0, 0] },
        uSpeed: { value: 0 },
        uTime: { value: 100 * Math.random() },
        uBorderRadius: { value: this.borderRadius }
      },
      transparent: true
    });

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = this.image;
    img.onload = () => {
      texture.image = img;
      this.program.uniforms.uImageSizes.value = [img.naturalWidth, img.naturalHeight];
    };
  }

  createMesh() {
    this.plane = new Mesh(this.gl, {
      geometry: this.geometry,
      program: this.program
    });
    this.plane.setParent(this.scene);
  }

  createTitle() {
    this.title = new Title({
      gl: this.gl,
      plane: this.plane,
      renderer: this.renderer,
      text: this.text,
      textColor: this.textColor,
      fontFamily: this.font
    });
  }

  update(scroll, direction) {
    this.plane.position.x = this.x - scroll.current - this.extra;
    const x = this.plane.position.x;
    const H = this.viewport.width / 2;

    if (this.bend === 0) {
      this.plane.position.y = 0;
      this.plane.rotation.z = 0;
    } else {
      const B_abs = Math.abs(this.bend);
      const R = (H * H + B_abs * B_abs) / (2 * B_abs);
      const effectiveX = Math.min(Math.abs(x), H);
      const arc = R - Math.sqrt(R * R - effectiveX * effectiveX);

      if (this.bend > 0) {
        this.plane.position.y = -arc;
        this.plane.rotation.z = -Math.sign(x) * Math.asin(effectiveX / R);
      } else {
        this.plane.position.y = arc;
        this.plane.rotation.z = Math.sign(x) * Math.asin(effectiveX / R);
      }
    }

    this.speed = scroll.current - scroll.last;
    this.program.uniforms.uTime.value += 0.04;
    this.program.uniforms.uSpeed.value = this.speed;

    const planeOffset = this.plane.scale.x / 2;
    const viewportOffset = this.viewport.width / 2;
    this.isBefore = this.plane.position.x + planeOffset < -viewportOffset;
    this.isAfter = this.plane.position.x - planeOffset > viewportOffset;

    if (direction === 'right' && this.isBefore) {
      this.extra -= this.widthTotal;
      this.isBefore = this.isAfter = false;
    }
    if (direction === 'left' && this.isAfter) {
      this.extra += this.widthTotal;
      this.isBefore = this.isAfter = false;
    }
  }

  onResize({ screen, viewport } = {}) {
    if (screen) this.screen = screen;
    if (viewport) {
      this.viewport = viewport;
      if (this.plane.program.uniforms.uViewportSizes) {
        this.plane.program.uniforms.uViewportSizes.value = [this.viewport.width, this.viewport.height];
      }
    }

    // Responsive scaling based on screen size
    const isMobile = this.screen.width < 768;
    const isTablet = this.screen.width >= 768 && this.screen.width < 1024;
    
    if (isMobile) {
      this.scale = this.screen.height / 2000; // Smaller scale for mobile
    } else if (isTablet) {
      this.scale = this.screen.height / 1750; // Medium scale for tablet
    } else {
      this.scale = this.screen.height / 1500; // Original scale for desktop
    }

    // Adjust plane dimensions based on screen size
    const heightMultiplier = isMobile ? 600 : isTablet ? 750 : 900;
    const widthMultiplier = isMobile ? 500 : isTablet ? 600 : 700;

    this.plane.scale.y = (this.viewport.height * (heightMultiplier * this.scale)) / this.screen.height;
    this.plane.scale.x = (this.viewport.width * (widthMultiplier * this.scale)) / this.screen.width;
    this.plane.program.uniforms.uPlaneSizes.value = [this.plane.scale.x, this.plane.scale.y];
    
    // Adjust padding for mobile
    this.padding = isMobile ? 1.5 : 2;
    this.width = this.plane.scale.x + this.padding;
    this.widthTotal = this.width * this.length;
    this.x = this.width * this.index;
  }
}

class App {
  constructor(
    container,
    {
      items,
      bend,
      textColor = '#ffffff',
      borderRadius = 0,
      font = 'bold 30px Figtree',
      scrollSpeed = 2,
      scrollEase = 0.05,
      onItemClick
    } = {}
  ) {
    // Safety check for container
    if (!container) {
      throw new Error('CircularGallery: Container element is required');
    }

    document.documentElement.classList.remove('no-js');
    this.container = container;
    this.scrollSpeed = scrollSpeed;
    this.scroll = { ease: scrollEase, current: 0, target: 0, last: 0 };
    this.onItemClick = onItemClick;
    this.onCheckDebounce = debounce(this.onCheck, 200);
    
    try {
      this.createRenderer();
      this.createCamera();
      this.createScene();
      this.onResize();
      this.createGeometry();
      this.createMedias(items, bend, textColor, borderRadius, font);
      this.update();
      this.addEventListeners();
    } catch (error) {
      console.error('CircularGallery App initialization error:', error);
      throw error;
    }
  }

  createRenderer() {
    // Optimize for mobile performance
    const isMobile = window.innerWidth < 768;
    const dpr = isMobile ? Math.min(window.devicePixelRatio || 1, 1.5) : Math.min(window.devicePixelRatio || 1, 2);
    
    try {
      this.renderer = new Renderer({
        alpha: true,
        antialias: !isMobile, // Disable antialias on mobile for better performance
        dpr: dpr
      });
      
      this.gl = this.renderer.gl;
      
      if (!this.gl || !this.gl.canvas) {
        console.error('unable to create webgl context');
        throw new Error('Failed to create WebGL context');
      }
      
      this.gl.clearColor(0, 0, 0, 0);
      
      // Ensure container exists before appending
      if (this.container && this.gl.canvas) {
        this.container.appendChild(this.gl.canvas);
      } else {
        throw new Error('Cannot append canvas: container or canvas is null');
      }
    } catch (error) {
      console.error('unable to create webgl context');
      throw new Error('WebGL initialization failed: ' + error.message);
    }
  }

  createCamera() {
    this.camera = new Camera(this.gl);
    this.camera.fov = 45;
    this.camera.position.z = 20;
  }

  createScene() {
    this.scene = new Transform();
  }

  createGeometry() {
    // Reduce geometry complexity on mobile for better performance
    const isMobile = window.innerWidth < 768;
    const heightSegments = isMobile ? 25 : 50;
    const widthSegments = isMobile ? 50 : 100;
    
    this.planeGeometry = new Plane(this.gl, {
      heightSegments: heightSegments,
      widthSegments: widthSegments
    });
  }

  createMedias(items, bend = 1, textColor, borderRadius, font) {
    const defaultItems = [
      { image: `https://picsum.photos/seed/1/800/600?grayscale`, text: 'Bridge' },
      { image: `https://picsum.photos/seed/2/800/600?grayscale`, text: 'Desk Setup' },
      { image: `https://picsum.photos/seed/3/800/600?grayscale`, text: 'Waterfall' },
      { image: `https://picsum.photos/seed/4/800/600?grayscale`, text: 'Strawberries' },
      { image: `https://picsum.photos/seed/5/800/600?grayscale`, text: 'Deep Diving' },
      { image: `https://picsum.photos/seed/16/800/600?grayscale`, text: 'Train Track' },
      { image: `https://picsum.photos/seed/17/800/600?grayscale`, text: 'Santorini' },
      { image: `https://picsum.photos/seed/8/800/600?grayscale`, text: 'Blurry Lights' },
      { image: `https://picsum.photos/seed/9/800/600?grayscale`, text: 'New York' },
      { image: `https://picsum.photos/seed/10/800/600?grayscale`, text: 'Good Boy' },
      { image: `https://picsum.photos/seed/21/800/600?grayscale`, text: 'Coastline' },
      { image: `https://picsum.photos/seed/12/800/600?grayscale`, text: 'Palm Trees' }
    ];

    const galleryItems = items && items.length ? items : defaultItems;
    this.mediasImages = galleryItems.concat(galleryItems);
    this.medias = this.mediasImages.map((data, index) => {
      return new Media({
        geometry: this.planeGeometry,
        gl: this.gl,
        image: data.image,
        index,
        length: this.mediasImages.length,
        renderer: this.renderer,
        scene: this.scene,
        screen: this.screen,
        text: data.text,
        viewport: this.viewport,
        bend,
        textColor,
        borderRadius,
        font,
        route: data.route,
        onItemClick: this.onItemClick
      });
    });
  }

  onTouchDown(e) {
    this.isDown = true;
    this.scroll.position = this.scroll.current;
    this.start = e.touches ? e.touches[0].clientX : e.clientX;
    this.startTime = Date.now();
  }

  onTouchMove(e) {
    if (!this.isDown) return;
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    const distance = (this.start - x) * (this.scrollSpeed * 0.025);
    this.scroll.target = this.scroll.position + distance;
  }

  onTouchUp(e) {
    if (!this.isDown) return;
    this.isDown = false;
    
    // Check if this was a click (short duration, minimal movement)
    const endTime = Date.now();
    const duration = endTime - this.startTime;
    const x = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
    const movement = Math.abs(this.start - x);
    
    // Check if click was on canvas
    const rect = this.gl.canvas.getBoundingClientRect();
    const clickX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
    const clickY = e.changedTouches ? e.changedTouches[0].clientY : e.clientY;
    const isOnCanvas = clickX >= rect.left && clickX <= rect.right && 
                       clickY >= rect.top && clickY <= rect.bottom;
    
    if (duration < 300 && movement < 10 && isOnCanvas) {
      // This was a click on the canvas, not a drag
      this.handleClick(e);
    }
    
    this.onCheck();
  }

  handleClick(e) {
    if (!this.onItemClick || !this.medias) return;
    
    // Get click position relative to canvas
    const rect = this.gl.canvas.getBoundingClientRect();
    const x = (e.changedTouches ? e.changedTouches[0].clientX : e.clientX) - rect.left;
    const y = (e.changedTouches ? e.changedTouches[0].clientY : e.clientY) - rect.top;
    
    // Convert to normalized coordinates
    const normalizedX = (x / rect.width) * 2 - 1;
    const normalizedY = -((y / rect.height) * 2 - 1);
    
    // Find the media item closest to the center (most likely clicked)
    let closestMedia = null;
    let minDistance = Infinity;
    
    this.medias.forEach(media => {
      // Calculate distance from center of viewport
      const mediaX = media.plane.position.x;
      const distance = Math.abs(mediaX);
      
      if (distance < minDistance && Math.abs(mediaX) < media.width / 2) {
        minDistance = distance;
        closestMedia = media;
      }
    });
    
    if (closestMedia && closestMedia.route) {
      this.onItemClick(closestMedia.route);
    }
  }

  onWheel(e) {
    const delta = e.deltaY || e.wheelDelta || e.detail;
    this.scroll.target += (delta > 0 ? this.scrollSpeed : -this.scrollSpeed) * 0.2;
    this.onCheckDebounce();
  }

  onCheck() {
    if (!this.medias || !this.medias[0]) return;
    const width = this.medias[0].width;
    const itemIndex = Math.round(Math.abs(this.scroll.target) / width);
    const item = width * itemIndex;
    this.scroll.target = this.scroll.target < 0 ? -item : item;
  }

  onResize() {
    this.screen = {
      width: this.container.clientWidth,
      height: this.container.clientHeight
    };
    this.renderer.setSize(this.screen.width, this.screen.height);
    this.camera.perspective({
      aspect: this.screen.width / this.screen.height
    });

    const fov = (this.camera.fov * Math.PI) / 180;
    const height = 2 * Math.tan(fov / 2) * this.camera.position.z;
    const width = height * this.camera.aspect;
    this.viewport = { width, height };

    if (this.medias) {
      this.medias.forEach(media => media.onResize({ screen: this.screen, viewport: this.viewport }));
    }
  }

  update() {
    this.scroll.current = lerp(this.scroll.current, this.scroll.target, this.scroll.ease);
    const direction = this.scroll.current > this.scroll.last ? 'right' : 'left';

    if (this.medias) {
      this.medias.forEach(media => media.update(this.scroll, direction));
    }

    this.renderer.render({ scene: this.scene, camera: this.camera });
    this.scroll.last = this.scroll.current;
    this.raf = window.requestAnimationFrame(this.update.bind(this));
  }

  addEventListeners() {
    this.boundOnResize = this.onResize.bind(this);
    this.boundOnWheel = this.onWheel.bind(this);
    this.boundOnTouchDown = this.onTouchDown.bind(this);
    this.boundOnTouchMove = this.onTouchMove.bind(this);
    this.boundOnTouchUp = this.onTouchUp.bind(this);

    window.addEventListener('resize', this.boundOnResize);
    
    // Add event listeners only to the canvas container, not the whole window
    this.gl.canvas.addEventListener('mousewheel', this.boundOnWheel);
    this.gl.canvas.addEventListener('wheel', this.boundOnWheel);
    this.gl.canvas.addEventListener('mousedown', this.boundOnTouchDown);
    this.gl.canvas.addEventListener('touchstart', this.boundOnTouchDown);
    
    // Keep mousemove/touchmove on window for smooth dragging
    window.addEventListener('mousemove', this.boundOnTouchMove);
    window.addEventListener('touchmove', this.boundOnTouchMove);
    window.addEventListener('mouseup', this.boundOnTouchUp);
    window.addEventListener('touchend', this.boundOnTouchUp);
  }

  destroy() {
    try {
      if (this.raf) {
        window.cancelAnimationFrame(this.raf);
      }
      
      if (this.boundOnResize) {
        window.removeEventListener('resize', this.boundOnResize);
      }
      
      // Remove event listeners from canvas
      if (this.gl && this.gl.canvas) {
        if (this.boundOnWheel) {
          this.gl.canvas.removeEventListener('mousewheel', this.boundOnWheel);
          this.gl.canvas.removeEventListener('wheel', this.boundOnWheel);
        }
        if (this.boundOnTouchDown) {
          this.gl.canvas.removeEventListener('mousedown', this.boundOnTouchDown);
          this.gl.canvas.removeEventListener('touchstart', this.boundOnTouchDown);
        }
      }
      
      // Remove window event listeners
      if (this.boundOnTouchMove) {
        window.removeEventListener('mousemove', this.boundOnTouchMove);
        window.removeEventListener('touchmove', this.boundOnTouchMove);
      }
      if (this.boundOnTouchUp) {
        window.removeEventListener('mouseup', this.boundOnTouchUp);
        window.removeEventListener('touchend', this.boundOnTouchUp);
      }

      // Remove canvas from DOM
      if (this.renderer && this.renderer.gl && this.renderer.gl.canvas) {
        const canvas = this.renderer.gl.canvas;
        if (canvas.parentNode) {
          canvas.parentNode.removeChild(canvas);
        }
      }
    } catch (error) {
      console.error('Error during CircularGallery cleanup:', error);
    }
  }
}

export default function CircularGallery({
  items,
  bend = 3,
  textColor = '#ffffff',
  borderRadius = 0.05,
  font = 'bold 30px Figtree',
  scrollSpeed = 2,
  scrollEase = 0.05,
  onItemClick
}) {
  const containerRef = useRef(null);
  const appRef = useRef(null);

  useEffect(() => {
    // Safety check: ensure container exists and has dimensions
    if (!containerRef.current) {
      console.warn('CircularGallery: Container ref is null');
      return;
    }

    // Check if container has dimensions
    const rect = containerRef.current.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
      console.warn('CircularGallery: Container has no dimensions');
      return;
    }

    try {
      const app = new App(containerRef.current, { 
        items, 
        bend, 
        textColor, 
        borderRadius, 
        font, 
        scrollSpeed, 
        scrollEase,
        onItemClick 
      });
      appRef.current = app;
      
      return () => {
        if (appRef.current) {
          appRef.current.destroy();
          appRef.current = null;
        }
      };
    } catch (error) {
      console.error('CircularGallery initialization error:', error);
    }
  }, [items, bend, textColor, borderRadius, font, scrollSpeed, scrollEase, onItemClick]);

  return <div className="w-full h-full overflow-hidden cursor-pointer select-none" ref={containerRef} />;
}
