import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import heroBackground from '../imgs/photo-1695326402341-e980b09af856.avif'
import {
  ATTACK_MOVES,
  ATTACKING_SETUP,
  BALL_ROUTE,
  DEFENDING_SETUP,
  HERO_STEPS,
  PITCH_DIMENSIONS,
  createPositionMap,
  getActiveBeat,
} from '../lib/tactics'

gsap.registerPlugin(ScrollTrigger)

const PUCK_RADIUS = 0.47
const PUCK_HEIGHT = 0.18

function loadFlagImage(src) {
  return new Promise((resolve) => {
    const image = new Image()
    image.crossOrigin = 'anonymous'
    image.onload = () => resolve(image)
    image.onerror = () => resolve(null)
    image.src = src
  })
}

function drawImageCover(context, image, x, y, width, height) {
  const imageRatio = image.width / image.height
  const frameRatio = width / height

  let drawWidth = width
  let drawHeight = height
  let offsetX = x
  let offsetY = y

  if (imageRatio > frameRatio) {
    drawWidth = height * imageRatio
    offsetX = x - (drawWidth - width) / 2
  } else {
    drawHeight = width / imageRatio
    offsetY = y - (drawHeight - height) / 2
  }

  context.drawImage(image, offsetX, offsetY, drawWidth, drawHeight)
}

function createPitchTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 1792

  const context = canvas.getContext('2d')
  const { width, height } = canvas
  const margin = 58

  context.fillStyle = '#173f30'
  context.fillRect(0, 0, width, height)

  const stripeHeight = height / 10
  for (let index = 0; index < 10; index += 1) {
    context.fillStyle = index % 2 === 0 ? '#1c4b39' : '#20553f'
    context.fillRect(0, index * stripeHeight, width, stripeHeight)
  }

  context.strokeStyle = 'rgba(246, 240, 225, 0.94)'
  context.lineWidth = 16
  context.strokeRect(margin, margin, width - margin * 2, height - margin * 2)

  context.beginPath()
  context.moveTo(margin, height / 2)
  context.lineTo(width - margin, height / 2)
  context.stroke()

  context.beginPath()
  context.arc(width / 2, height / 2, 122, 0, Math.PI * 2)
  context.stroke()

  context.fillStyle = 'rgba(246, 240, 225, 0.94)'
  context.beginPath()
  context.arc(width / 2, height / 2, 9, 0, Math.PI * 2)
  context.fill()

  ;[
    { y: margin, boxDepth: 282, sixDepth: 112, invert: 1 },
    { y: height - margin, boxDepth: -282, sixDepth: -112, invert: -1 },
  ].forEach(({ y, boxDepth, sixDepth, invert }) => {
    context.strokeRect(width * 0.18, y, width * 0.64, boxDepth)
    context.strokeRect(width * 0.34, y, width * 0.32, sixDepth)

    context.beginPath()
    context.arc(width / 2, y + boxDepth - 114 * invert, 9, 0, Math.PI * 2)
    context.fill()

    context.beginPath()
    context.arc(
      width / 2,
      y + boxDepth - 114 * invert,
      98,
      invert > 0 ? 0.2 * Math.PI : 1.2 * Math.PI,
      invert > 0 ? 0.8 * Math.PI : 1.8 * Math.PI,
    )
    context.stroke()
  })

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 8
  return texture
}

function createMarkerTexture(team, number, flagImage) {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512

  const context = canvas.getContext('2d')
  context.imageSmoothingQuality = 'high'

  context.fillStyle = team.primary
  context.beginPath()
  context.arc(256, 256, 250, 0, Math.PI * 2)
  context.fill()

  context.fillStyle = 'rgba(248, 242, 228, 0.98)'
  context.beginPath()
  context.arc(256, 256, 214, 0, Math.PI * 2)
  context.fill()

  context.save()
  context.beginPath()
  context.arc(256, 210, 146, 0, Math.PI * 2)
  context.clip()

  if (flagImage) {
    drawImageCover(context, flagImage, 110, 64, 292, 292)
  } else {
    context.fillStyle = team.secondary
    context.fillRect(110, 64, 292, 292)
    context.fillStyle = team.primary
    context.font = '700 120px "Trebuchet MS", sans-serif'
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    context.fillText(team.name.slice(0, 2).toUpperCase(), 256, 210)
  }

  context.restore()

  context.strokeStyle = 'rgba(15, 29, 26, 0.12)'
  context.lineWidth = 8
  context.beginPath()
  context.arc(256, 210, 146, 0, Math.PI * 2)
  context.stroke()

  context.fillStyle = 'rgba(9, 17, 18, 0.82)'
  context.beginPath()
  context.ellipse(256, 370, 88, 54, 0, 0, Math.PI * 2)
  context.fill()

  context.strokeStyle = 'rgba(255, 255, 255, 0.18)'
  context.lineWidth = 4
  context.beginPath()
  context.ellipse(256, 370, 88, 54, 0, 0, Math.PI * 2)
  context.stroke()

  context.fillStyle = '#f8f2e4'
  context.font = '700 132px "Trebuchet MS", sans-serif'
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.fillText(String(number), 256, 374)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 8
  return texture
}

function disposeScene(root) {
  root.traverse((object) => {
    if (object.geometry) {
      object.geometry.dispose()
    }

    if (Array.isArray(object.material)) {
      object.material.forEach((material) => {
        if (material.map) {
          material.map.dispose()
        }

        material.dispose()
      })
      return
    }

    if (object.material) {
      if (object.material.map) {
        object.material.map.dispose()
      }

      object.material.dispose()
    }
  })
}

function TacticalHero({ matchup }) {
  const sectionRef = useRef(null)
  const canvasRef = useRef(null)
  const activeBeatRef = useRef(0)
  const [activeBeat, setActiveBeat] = useState(0)
  const [sceneReady, setSceneReady] = useState(false)

  useEffect(() => {
    const sectionElement = sectionRef.current
    const canvasElement = canvasRef.current

    if (!sectionElement || !canvasElement) {
      return undefined
    }

    setSceneReady(false)
    setActiveBeat(0)
    activeBeatRef.current = 0

    let renderer
    let timeline
    let mounted = true
    let cleanupScene = () => {}

    const attackingPositions = createPositionMap(ATTACKING_SETUP)
    const defensiveState = { entry: 0 }
    const ballState = { lift: 0 }

    async function initScene() {
      const [attackFlag, defenseFlag] = await Promise.all([
        loadFlagImage(matchup.attack.flagUrl),
        loadFlagImage(matchup.defense.flagUrl),
      ])

      if (!mounted) {
        return
      }

      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(24, 1, 0.1, 100)

      renderer = new THREE.WebGLRenderer({
        canvas: canvasElement,
        alpha: true,
        antialias: true,
      })
      renderer.outputColorSpace = THREE.SRGBColorSpace
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8))

      const resizeScene = () => {
        if (!renderer) {
          return
        }

        const width = sectionElement.clientWidth
        const height = sectionElement.clientHeight
        const isMobile = width < 720

        renderer.setSize(width, height, false)
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8))

        camera.aspect = width / height
        camera.fov = isMobile ? 30 : 24
        camera.position.set(0, isMobile ? 0.9 : 0.55, isMobile ? 24.8 : 22.8)
        camera.lookAt(0, -0.9, 0)
        camera.updateProjectionMatrix()
      }

      window.addEventListener('resize', resizeScene)
      resizeScene()

      const ambientLight = new THREE.AmbientLight('#ffffff', 2.2)
      const keyLight = new THREE.DirectionalLight('#ffffff', 1.55)
      keyLight.position.set(3.5, -7, 12)
      const fillLight = new THREE.PointLight('#f3c48d', 20, 32, 2)
      fillLight.position.set(-4.5, 4.5, 12)

      scene.add(ambientLight, keyLight, fillLight)

      const boardShadow = new THREE.Mesh(
        new THREE.PlaneGeometry(PITCH_DIMENSIONS.width + 1.6, PITCH_DIMENSIONS.length + 1.8),
        new THREE.MeshBasicMaterial({
          color: '#08130f',
          transparent: true,
          opacity: 0.22,
        }),
      )
      boardShadow.position.set(0, -0.15, -0.24)
      scene.add(boardShadow)

      const pitchFrame = new THREE.Mesh(
        new THREE.PlaneGeometry(PITCH_DIMENSIONS.width + 0.84, PITCH_DIMENSIONS.length + 0.84),
        new THREE.MeshStandardMaterial({
          color: '#10271d',
          roughness: 0.96,
          metalness: 0.02,
        }),
      )
      pitchFrame.position.set(0, 0, -0.14)
      scene.add(pitchFrame)

      const pitch = new THREE.Mesh(
        new THREE.PlaneGeometry(PITCH_DIMENSIONS.width, PITCH_DIMENSIONS.length),
        new THREE.MeshStandardMaterial({
          map: createPitchTexture(),
          roughness: 0.98,
          metalness: 0.01,
        }),
      )
      scene.add(pitch)

      // Scene setup: shared player geometry and team-specific marker materials.
      const playerGeometry = new THREE.CylinderGeometry(
        PUCK_RADIUS,
        PUCK_RADIUS,
        PUCK_HEIGHT,
        48,
      )
      playerGeometry.rotateX(Math.PI / 2)

      const attackingSideMaterial = new THREE.MeshStandardMaterial({
        color: matchup.attack.primary,
        roughness: 0.92,
        metalness: 0.03,
      })
      const defendingSideMaterial = new THREE.MeshStandardMaterial({
        color: matchup.defense.primary,
        roughness: 0.92,
        metalness: 0.03,
      })

      const attackingPlayers = {}
      const defendingPlayers = []

      ATTACKING_SETUP.forEach((player) => {
        const mesh = new THREE.Mesh(playerGeometry, [
          attackingSideMaterial,
          new THREE.MeshStandardMaterial({
            map: createMarkerTexture(matchup.attack, player.number, attackFlag),
            roughness: 0.88,
            metalness: 0.02,
          }),
          attackingSideMaterial,
        ])

        mesh.position.set(player.x, player.y, 0.12)
        mesh.castShadow = false
        mesh.receiveShadow = false
        attackingPlayers[player.number] = mesh
        scene.add(mesh)
      })

      DEFENDING_SETUP.forEach((player) => {
        const mesh = new THREE.Mesh(playerGeometry, [
          defendingSideMaterial,
          new THREE.MeshStandardMaterial({
            map: createMarkerTexture(matchup.defense, player.number, defenseFlag),
            roughness: 0.88,
            metalness: 0.02,
          }),
          defendingSideMaterial,
        ])

        mesh.position.set(player.x, player.y - 5.8, 0.12)
        mesh.userData.baseX = player.x
        mesh.userData.baseY = player.y
        mesh.userData.spawnY = player.y - 5.8
        mesh.userData.shiftStrength = player.shiftStrength
        defendingPlayers.push(mesh)
        scene.add(mesh)
      })

      const ballShadow = new THREE.Mesh(
        new THREE.RingGeometry(0.12, 0.28, 40),
        new THREE.MeshBasicMaterial({
          color: '#08130f',
          transparent: true,
          opacity: 0.24,
          side: THREE.DoubleSide,
          depthWrite: false,
        }),
      )
      ballShadow.position.set(attackingPositions[1].x, attackingPositions[1].y, 0.03)
      scene.add(ballShadow)

      const ballHalo = new THREE.Mesh(
        new THREE.RingGeometry(0.17, 0.34, 48),
        new THREE.MeshBasicMaterial({
          color: '#f18d58',
          transparent: true,
          opacity: 0.22,
          side: THREE.DoubleSide,
          depthWrite: false,
        }),
      )
      ballHalo.position.set(attackingPositions[1].x, attackingPositions[1].y, 0.05)
      scene.add(ballHalo)

      const ball = new THREE.Mesh(
        new THREE.SphereGeometry(0.18, 32, 32),
        new THREE.MeshStandardMaterial({
          color: '#f8f2e4',
          emissive: '#ef7b45',
          emissiveIntensity: 0.24,
          roughness: 0.36,
          metalness: 0.04,
        }),
      )
      ball.position.set(attackingPositions[1].x, attackingPositions[1].y, 0.36)
      scene.add(ball)

      // Tactical positioning: attacking runs are animated while the defensive block
      // shifts laterally according to the ball's X position.
      const renderClock = new THREE.Clock()
      renderer.setAnimationLoop(() => {
        const elapsed = renderClock.getElapsedTime()
        const pulse = (Math.sin(elapsed * 4.8) + 1) * 0.012
        const ballX = ball.position.x

        defendingPlayers.forEach((defender) => {
          const shift = THREE.MathUtils.clamp(
            ballX * defender.userData.shiftStrength,
            -1.35,
            1.35,
          )
          const targetY = THREE.MathUtils.lerp(
            defender.userData.spawnY,
            defender.userData.baseY,
            defensiveState.entry,
          )

          defender.position.x = THREE.MathUtils.lerp(defender.position.x, defender.userData.baseX + shift, 0.11)
          defender.position.y = THREE.MathUtils.lerp(defender.position.y, targetY, 0.08)
        })

        ball.position.z = 0.34 + ballState.lift + pulse
        ballShadow.position.x = ball.position.x
        ballShadow.position.y = ball.position.y
        ballShadow.scale.setScalar(1 + ballState.lift * 1.25)
        ballShadow.material.opacity = 0.24 - Math.min(ballState.lift * 0.25, 0.16)

        ballHalo.position.x = ball.position.x
        ballHalo.position.y = ball.position.y
        ballHalo.scale.setScalar(1 + pulse * 18)
        ballHalo.material.opacity = 0.16 + pulse * 5

        renderer.render(scene, camera)
      })

      const scrollContext = gsap.context(() => {
        // GSAP timeline: ball circulation, supporting runs, and pinned scroll playback.
        timeline = gsap.timeline({
          defaults: {
            duration: 0.84,
            ease: 'power2.inOut',
          },
          scrollTrigger: {
            trigger: sectionElement,
            start: 'top top',
            end: '+=220%',
            pin: true,
            scrub: 0.8,
            invalidateOnRefresh: true,
            onUpdate: ({ progress }) => {
              const nextBeat = getActiveBeat(progress)
              if (nextBeat !== activeBeatRef.current) {
                activeBeatRef.current = nextBeat
                setActiveBeat(nextBeat)
              }
            },
          },
        })

        timeline.to(defensiveState, { entry: 1, duration: 0.72 }, 0)
        timeline.to(ball.position, { x: attackingPositions[4].x, y: attackingPositions[4].y, duration: 0.7 }, 0.04)
        timeline.to(ball.position, { x: attackingPositions[6].x, y: attackingPositions[6].y }, '>')
        timeline.to(attackingPlayers[7].position, { x: ATTACK_MOVES[7].x, y: ATTACK_MOVES[7].y }, '<0.08')
        timeline.to(ball.position, { x: ATTACK_MOVES[7].x, y: ATTACK_MOVES[7].y }, '>')
        timeline.to(attackingPlayers[10].position, { x: ATTACK_MOVES[10].x, y: ATTACK_MOVES[10].y }, '<0.05')
        timeline.to(ball.position, { x: ATTACK_MOVES[10].x, y: ATTACK_MOVES[10].y }, '>')
        timeline.to(
          attackingPlayers[11].position,
          {
            x: ATTACK_MOVES[11].diagonal.x,
            y: ATTACK_MOVES[11].diagonal.y,
            duration: 0.95,
          },
          '<0.05',
        )
        timeline.to(
          ball.position,
          {
            x: ATTACK_MOVES[11].diagonal.x,
            y: ATTACK_MOVES[11].diagonal.y,
            duration: 0.82,
          },
          '>',
        )
        timeline.to(
          attackingPlayers[11].position,
          {
            x: ATTACK_MOVES[11].cross.x,
            y: ATTACK_MOVES[11].cross.y,
            duration: 0.72,
          },
          '<0.08',
        )
        timeline.to(
          attackingPlayers[9].position,
          {
            x: ATTACK_MOVES[9].x,
            y: ATTACK_MOVES[9].y,
            duration: 1.04,
          },
          '<0.04',
        )
        timeline.to(ballState, { lift: 0.24, duration: 0.26, ease: 'power1.out' }, '>')
        timeline.to(
          ball.position,
          {
            x: BALL_ROUTE.crossTarget.x,
            y: BALL_ROUTE.crossTarget.y,
            duration: 0.6,
          },
          '<',
        )
        timeline.to(ballState, { lift: 0.04, duration: 0.34, ease: 'power2.in' }, '<0.18')
        timeline.to(ballState, { lift: 0.18, duration: 0.2, ease: 'power1.out' }, '>')
        timeline.to(
          ball.position,
          {
            x: BALL_ROUTE.finish.x,
            y: BALL_ROUTE.finish.y,
            duration: 0.5,
          },
          '<',
        )
        timeline.to(ballState, { lift: 0, duration: 0.28, ease: 'power2.in' }, '<0.18')
      }, sectionElement)

      setSceneReady(true)
      ScrollTrigger.refresh()

      cleanupScene = () => {
        window.removeEventListener('resize', resizeScene)
        scrollContext.revert()
        renderer.setAnimationLoop(null)
        disposeScene(scene)
        renderer.dispose()
      }
    }

    initScene()

    return () => {
      mounted = false
      cleanupScene()

      if (timeline) {
        timeline.kill()
      }
    }
  }, [matchup])

  return (
    <section className="hero" id="home" ref={sectionRef}>
      <div
        className="hero__canvas-wrap"
        aria-hidden="true"
        style={{ backgroundImage: `url(${heroBackground})` }}
      >
        <canvas className="hero__canvas" ref={canvasRef} />
        <div className="hero__scrim" />
      </div>

      <div className="hero__content">
        <div className="hero__copy">
          <p className="eyebrow">Soccer Podcast</p>
          <div className="hero__matchup" aria-label="Current matchup">
            <span>{matchup.attack.name}</span>
            <span>attacks</span>
            <span>{matchup.defense.name}</span>
          </div>
          <h1>Scroll the passing move. Stretch the block. Finish at the far post.</h1>
          <p className="hero__lede">
            Tiki Taki Tiki Talk turns possession into a reading experience. The hero board
            reacts to your scroll and rebuilds a classic passing sequence from
            goalkeeper to finish.
          </p>
          <div className="hero__actions">
            <a className="button button--primary" href="#newsletter">
              Subscribe
            </a>
            <a className="button button--ghost" href="#about">
              Read The Shape
            </a>
          </div>
          <p className="hero__status">
            {sceneReady
              ? 'Scroll to scrub the sequence and load a new international matchup on refresh.'
              : 'Loading flags, textures, and the tactical board.'}
          </p>
        </div>

        <aside className="hero__steps" aria-label="Passing sequence">
          {HERO_STEPS.map((step, index) => (
            <article
              className={`hero-step${activeBeat === index ? ' hero-step--active' : ''}`}
              key={step.title}
            >
              <p>{step.cue}</p>
              <h2>{step.title}</h2>
              <span>{step.detail}</span>
            </article>
          ))}
        </aside>
      </div>
    </section>
  )
}

export default TacticalHero
