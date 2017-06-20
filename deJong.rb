START_COORDS = [500, 500]

def setup
  size 500, 500
  no_fill
  smooth
  color_mode HSB, 255
  @stop = false
  @step_counter = 0
  @dj = DeJongAttractor.new
  @dj.reparam(*START_COORDS)
end

def draw
  if @stopped
    @dj.reparam if mouse_x != pmouse_x || mouse_y != pmouse_y
  else
    @step_counter += 1
    return @stopped = true if @step_counter > 127
    @dj.incremental_update
  end
  image(@dj.pi, 0, 0, width, height)
end

def mouse_pressed
  @stopped = true
end

def mouse_released
  @stopped = false
  @step_counter = 0
end

class DeJongAttractor

  attr_reader :pi

  SENSITIVITY = 0.017
  ITERATIONS = 1000
  DENSITY = 5

  def initialize
    @pi = nil
    @pa, @pb, @pc, @pd, @newx, @newy, @oldx, @oldy, @logmaxd = *Array.new(9) { 0.0 }
    @n = width
    @maxdense = 0
    clear_densities
  end

  def clear_densities
    @density = Array.new(@n) { Array.new(@n) { 0 } }
    @previousx = Array.new(@n) { Array.new(@n) { 0.0 } }
  end

  def construct(x=nil, y=nil)
    @pa = (((x || mouse_x) * 2.0 / width.to_f) - 1.0) * SENSITIVITY
    @pb = (((y || mouse_y) * 2.0 / height.to_f) - 1.0) * SENSITIVITY
    @pc = -@pa
    @pd = -@pb
    @oldx = width / 2.0
    @oldy = height / 2.0
  end

  def populate(samples, clear)
    clear_densities if clear
    samples.times do |i|
      ITERATIONS.times do |j|
        # De Jong's attractor
        @newx = ((Math.sin(@pa * @oldy) - Math.cos(@pb * @oldx)) * @n * 0.2) + @n / 2.0
        @newy = ((Math.sin(@pc * @oldx) - Math.cos(@pd * @oldy)) * @n * 0.2) + @n / 2.0
        # Smoothie
        @newx += (rand * 0.002) - 0.001
        @newy += (rand * 0.002) - 0.001
        # If coordinates are within range, increase density
        if @newx > 0 && @newx < @n && @newy > 0 && @newy < @n
          @density[@newx.to_i][@newy.to_i] += DENSITY
          @previousx[@newx.to_i][@newy.to_i] = @oldx
        end
        @oldx, @oldy = @newx, @newy
      end
    end
    # Save the maximum density and its log value.
    @maxdense = @density.flatten.max
    @logmaxd = Math.log(@maxdense)
  end

  def incremental_update
    populate 16, false
    plot 0, false
    redraw
  end

  def reparam(x=nil, y=nil)
    construct(x, y)
    populate 1, true
    plot 100, true
  end

  def plot(factor, clear)
    @pi = $app.create_image(@n, @n, RGB) if clear
    @pi.load_pixels
    @n.times do |i|
      @n.times do |j|
        if @density[i][j] > 0
          myhue = @previousx[i][j] / @n.to_f * 128 + 127
          mysat = Math.log(@density[i][j]) / @logmaxd * -128 + 128
          mybright = Math.log(@density[i][j]) / @logmaxd * 255 + factor
          newc = color(myhue, mysat, mybright)
          # oldc = @pi.pixels[i * @n + j]
          # newc = blend_color(newc, oldc, SOFT_LIGHT)
          @pi.pixels[i * @n + j] = newc
        end
      end
    end
    @pi.update_pixels
    return @pi
  end

end
