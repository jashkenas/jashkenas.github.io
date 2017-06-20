#### Constants and Values

# Sensitivity of the sketch to mouse coordinates.
sensitivity = 0.02

# Base of the iterations of the attractor per frame.
iterations = 8000

# Each time the attractor hits a pixel, the density increases by...
density = 2

# Start x,y coordinate for the attractor.
start = 0

# The number of frames to render before being finished.
limit = 200

# Size of the canvas in dimensional and then real pixels.
size = Math.round(document.body.clientWidth - (document.body.clientWidth * 0.3))
N = size * (window.devicePixelRatio or 1)

# Create the `canvas` element and grab its drawing `context`.
canvas = document.createElement 'canvas'
canvas.width = canvas.height = N
canvas.style.width = canvas.style.height = "#{size}px"
canvas.style.marginTop = canvas.style.marginLeft = "-#{ size / 2 }px"
document.body.appendChild canvas
context = canvas.getContext '2d'

# Pull some handy math functions off the `Math` object, for convenient access.
{round, log, max, sin, cos} = Math

# Initialize the mouse coordinates to our `start`.
mouseX = mouseY = start


#### Sketch

# Our **Sketch** class handles drawing to the `<canvas>` element.
class Sketch

  constructor: ->
    @steps     = 0
    @stopped   = no
    @button    = document.getElementById 'permalink'
    @button.addEventListener  'mousedown', @permalink,  no
    document.addEventListener 'mousedown', @pause,      no
    document.addEventListener 'mousemove', @record,     no
    document.addEventListener 'mouseup',   @resume,     no
    @initialSeed()
    @attractor = new DeJongAttractor
    @loop()

  loop: ->
    @interval = setInterval @tick, 0

  stopLoop: ->
    @interval = clearInterval @interval

  # Draw a single frame of the sketch.
  tick: =>
    return @attractor.reseed() if @stopped
    @steps += 1
    @attractor.plot 5
    @stopLoop() if @steps > limit

  # Determine the initial seed.
  initialSeed: ->
    if hash = window.location.hash.replace('#', '')
      [mouseX, mouseY] = (parseInt(num, 10) for num in hash.split(','))

  # Pause the drawing, when we've rendered enough steps.
  pause: (e) =>
    e.preventDefault()
    @stopped = yes
    @loop() unless @interval

  # Record the current mouse position.
  record: (e) =>
    if @stopped
      mouseX = e.pageX - canvas.offsetLeft
      mouseY = e.pageY - canvas.offsetTop

  # Resume drawing the sketch.
  resume: =>
    @stopped = no
    @steps   = 0

  # Save the permalink of the currently-drawn attractor to the URL.
  permalink: (e) =>
    e.stopPropagation()
    window.location.hash = mouseX + ',' + mouseY


#### DeJongAttractor

# The **DeJongAttractor** contains the Peter De Jong algorithm.
class DeJongAttractor

  constructor: ->
    @reseed()

  # Clear the recorded exposures before seeding at a different location.
  clear: ->
    @image      = context.createImageData N, N
    @density    = (0 for i in [0...N] for j in [0...N])
    @maxDensity = 0

  # Seed the sketch at the current position of the mouse.
  seed: ->
    @xSeed   = (mouseX * 2 / N - 1) * sensitivity
    @ySeed   = (mouseY * 2 / N - 1) * sensitivity
    [@x, @y] = [N / 2, N / 2]

  # De Jong's attractor. Iterates a large number of times through random
  # coordinates in the attractor space, exposing the `@density` array.
  populate: (samples) ->
    for i in [0...samples * iterations]
      x = ((sin(@xSeed * @y) - cos(@ySeed * @x)) * N * 0.2) + N / 2
      y = ((sin(-@xSeed * @x) - cos(-@ySeed * @y)) * N * 0.2) + N / 2
      @density[round x][round y] += density
      [@x, @y] = [x, y]
    @maxDensity = log max.apply(Math, (max.apply(Math, row) for row in @density))

  reseed: ->
    @clear()
    @seed()
    @plot 3

  # Soft light color blend between two brighness values.
  softLight: (a, b) ->
    ((a * b) >> 7) + ((a * a) >> 8) - ((a * a * b) >> 15)

  # Plots each pixel on the canvas as `ImageData`, using the `@maxDensity` to
  # adjust for over- or under-exposure.
  plot: (samples) ->
    @populate samples
    data = @image.data
    for i in [0...N]
      for j in [0...N]
        dens = @density[i][j]
        idx = (i * N + j) * 4
        data[idx + 3] = 255
        continue if dens <= 0
        light = log(dens) / @maxDensity * 255
        current = data[idx]
        color = @softLight light, current
        data[idx] = data[idx + 1] = data[idx + 2] = color
    context.putImageData @image, 0, 0

# Kick it off by creating the sketch.
new Sketch()
