// URL: https://beta.observablehq.com/@jashkenas/breakout
// Title: Breakout!
// Author: Jeremy Ashkenas (@jashkenas)
// Version: 1006

const notebook = {
  id: "5611c97c55aa59b7@1006",
  runtimeVersion: "1.0.0",
  modules: [
    {
      id: "5611c97c55aa59b7@1006",
      variables: [
        {
          inputs: ["md", "highscore", "score", "gameover"],
          value: function(md, highscore, score, gameover) {
            return md`# Breakout!
### High Score: ${highscore}
### Score: ${score}
*This notebook demonstrates using [mutable state](https://beta.observablehq.com/@jashkenas/introduction-to-mutable-state) to build a clone of [Atari Brakeout](https://en.wikipedia.org/wiki/Breakout_(video_game)). Adjust the parameters or code below, or watch [the screencast](https://www.youtube.com/watch?v=Aznz6oLbuFQ) to live code along...*
# <marquee style="max-width: 250px">${
              gameover ? "GAME OVER" : "&nbsp;"
            }</marquee>`;
          }
        },
        {
          name: "viewof c",
          inputs: ["DOM", "w", "h"],
          value: function(DOM, w, h) {
            var c = DOM.context2d(w, h);
            c.canvas.value = c;
            c.canvas.style.cursor = "none";
            return c.canvas;
          }
        },
        {
          name: "c",
          inputs: ["Generators", "viewof c"],
          value: (G, _) => G.input(_)
        },
        {
          name: "viewof newgame",
          inputs: ["button"],
          value: function(button) {
            return button("New Game");
          }
        },
        {
          name: "newgame",
          inputs: ["Generators", "viewof newgame"],
          value: (G, _) => G.input(_)
        },
        {
          name: "initial score",
          inputs: ["newgame"],
          value: function(newgame) {
            newgame;
            return 0;
          }
        },
        {
          name: "mutable score",
          inputs: ["Mutable", "initial score"],
          value: (M, _) => new M(_)
        },
        {
          name: "score",
          inputs: ["mutable score"],
          value: _ => _.generator
        },
        {
          name: "highscore",
          inputs: ["score"],
          value: function(score) {
            return Math.max(this || 0, score);
          }
        },
        {
          name: "initial gameover",
          inputs: ["newgame"],
          value: function(newgame) {
            newgame;
            return false;
          }
        },
        {
          name: "mutable gameover",
          inputs: ["Mutable", "initial gameover"],
          value: (M, _) => new M(_)
        },
        {
          name: "gameover",
          inputs: ["mutable gameover"],
          value: _ => _.generator
        },
        {
          name: "viewof w",
          inputs: ["slider", "width"],
          value: function(slider, width) {
            return slider({ min: 100, max: width, value: 700, step: 1 });
          }
        },
        {
          name: "w",
          inputs: ["Generators", "viewof w"],
          value: (G, _) => G.input(_)
        },
        {
          name: "viewof h",
          inputs: ["slider"],
          value: function(slider) {
            return slider({ min: 100, max: 800, value: 350, step: 1 });
          }
        },
        {
          name: "h",
          inputs: ["Generators", "viewof h"],
          value: (G, _) => G.input(_)
        },
        {
          name: "viewof speed",
          inputs: ["slider"],
          value: function(slider) {
            return slider({ min: 0.1, max: 10, step: 0.1, value: 5 });
          }
        },
        {
          name: "speed",
          inputs: ["Generators", "viewof speed"],
          value: (G, _) => G.input(_)
        },
        {
          name: "viewof scale",
          inputs: ["slider"],
          value: function(slider) {
            return slider({ min: 2, max: 20, value: 12, step: 1 });
          }
        },
        {
          name: "scale",
          inputs: ["Generators", "viewof scale"],
          value: (G, _) => G.input(_)
        },
        {
          name: "viewof paddleLength",
          inputs: ["slider"],
          value: function(slider) {
            return slider({ min: 20, max: 150, value: 90, step: 1 });
          }
        },
        {
          name: "paddleLength",
          inputs: ["Generators", "viewof paddleLength"],
          value: (G, _) => G.input(_)
        },
        {
          inputs: ["md"],
          value: function(md) {
            return md`
## Watch the screencast:

<iframe width="400" height="225" src="https://www.youtube-nocookie.com/embed/Aznz6oLbuFQ?rel=0" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>
            `;
          }
        },
        {
          inputs: ["md"],
          value: function(md) {
            return md`
The _mutable_ ball is reset to the middle of the screen when a new game begins.
            `;
          }
        },
        {
          name: "initial ball",
          inputs: ["newgame", "scale", "w", "h", "speed"],
          value: function(newgame, scale, w, h, speed) {
            newgame;
            return {
              r: scale * 0.7,
              x: w / 2,
              y: h - scale * 2,
              dx: 0,
              dy: -speed
            };
          }
        },
        {
          name: "mutable ball",
          inputs: ["Mutable", "initial ball"],
          value: (M, _) => new M(_)
        },
        {
          name: "ball",
          inputs: ["mutable ball"],
          value: _ => _.generator
        },
        {
          inputs: ["md"],
          value: function(md) {
            return md`
In the main \`gameloop\`, we:

* Move the \`ball\` according to its current velocity.
* Check to see if it should bounce off the walls or the paddle.
* Bounce it off any collided brick (removing the brick from the game).
* Set \`gameover\` if the ball has snuck past your paddle to hit the bottom edge of the screen.
            `;
          }
        },
        {
          name: "gameloop",
          inputs: [
            "mutable ball",
            "mutable gameover",
            "scale",
            "w",
            "speed",
            "mutable paddleX",
            "h",
            "paddleLength",
            "eachBrick",
            "bricks",
            "collide",
            "mutable score"
          ],
          value: function*(
            $0,
            $1,
            scale,
            w,
            speed,
            $2,
            h,
            paddleLength,
            eachBrick,
            bricks,
            collide,
            $3
          ) {
            let { r, x, y, dx, dy } = $0.value;

            while (!$1.value) {
              // Move the ball.
              (x += dx), (y += dy);

              // Bounce off walls.
              if (x < r + scale) dx = Math.abs(dx);
              if (x + r > w - scale) dx = -Math.abs(dx);
              if (y < r + scale) dy = speed;

              // Bounce off paddle.
              let px = $2.value;
              if (
                y + r > h - scale &&
                x + r > px &&
                x - r < px + paddleLength
              ) {
                dy = -speed;
                dx = ((x - px) / paddleLength - 0.5) * Math.PI * speed;
              }

              // Bounce off bricks.
              eachBrick(bricks, (brick, row, col) => {
                let hit;
                if (!(hit = collide($0.value, brick))) return;
                bricks[row][col] = null;
                $3.value += brick.points;
                hit == "v" ? (dy = -dy) : (dx = -dx);
                return true;
              });

              $0.value = { r, x, y, dx, dy };
              if (y + r > h) $1.value = true;
              yield true;
            }
          }
        },
        {
          inputs: ["md"],
          value: function(md) {
            return md`
Our draw cell is responsible for rendering the game state to the canvas \`c\`, and is called for every tick of the \`gameloop\`.
            `;
          }
        },
        {
          name: "draw",
          inputs: [
            "gameloop",
            "c",
            "w",
            "h",
            "scale",
            "eachBrick",
            "bricks",
            "colors",
            "mutable paddleX",
            "paddleLength",
            "mutable ball"
          ],
          value: function(
            gameloop,
            c,
            w,
            h,
            scale,
            eachBrick,
            bricks,
            colors,
            $0,
            paddleLength,
            $1
          ) {
            gameloop;

            // Draw the background.
            c.fillStyle = "black";
            c.fillRect(0, 0, w, h);

            // Draw the walls.
            c.fillStyle = "#444";
            c.fillRect(0, 0, scale, h);
            c.fillRect(0, 0, w, scale);
            c.fillRect(w - scale, 0, scale, h);

            // Draw the bricks.
            eachBrick(bricks, brick => {
              c.fillStyle = brick.color;
              c.fillRect(brick.x, brick.y, brick.w, brick.h);
            });

            // Draw the paddle.
            c.fillStyle = colors[0];
            c.fillRect($0.value, h - scale, paddleLength, scale);

            // Draw the ball.
            const { r, x, y } = $1.value;
            c.beginPath();
            c.fillStyle = colors[0];
            c.arc(x, y, r, 0, 2 * Math.PI);
            c.fill();
            return true;
          }
        },
        {
          inputs: ["md"],
          value: function(md) {
            return md`
We don't want the paddle’s X position to affect the speed at which the gameloop ticks, so we define it as a \`mutable\` value that the \`gameloop\` can read from non-reactively.
            `;
          }
        },
        {
          name: "initial paddleX",
          inputs: ["w", "paddleLength"],
          value: function(w, paddleLength) {
            return w / 2 - paddleLength / 2;
          }
        },
        {
          name: "mutable paddleX",
          inputs: ["Mutable", "initial paddleX"],
          value: (M, _) => new M(_)
        },
        {
          name: "paddleX",
          inputs: ["mutable paddleX"],
          value: _ => _.generator
        },
        {
          inputs: ["md"],
          value: function(md) {
            return md`
When the mouse moves over the canvas, update \`paddleX\`, constraining it to the screen space.
            `;
          }
        },
        {
          name: "mousemove",
          inputs: ["c", "mutable paddleX", "scale", "paddleLength", "w"],
          value: function(c, $0, scale, paddleLength, w) {
            return (c.canvas.onmousemove = e => {
              $0.value = Math.min(
                Math.max(scale, e.offsetX - paddleLength / 2),
                w - paddleLength - scale
              );
            });
          }
        },
        {
          inputs: ["md"],
          value: function(md) {
            return md`
Our collision dection function between a brick and the ball. Returns \`"h"\` if the ball bounced off the side of the brick, and \`"v"\` if it hit the top or bottom.
            `;
          }
        },
        {
          name: "collide",
          value: function() {
            return function collide(ball, brick) {
              const { x, y, r, dx, dy } = ball;
              let hit =
                x + r > brick.x &&
                x - r < brick.x + brick.w &&
                y + r > brick.y &&
                y - r < brick.y + brick.h;
              if (!hit) return false;
              if (y - dy + r <= brick.y || y - dy - r >= brick.y + brick.h)
                return "v";
              if (x - dx + r <= brick.x || x - dx - r >= brick.x + brick.w)
                return "h";
            };
          }
        },
        {
          inputs: ["md"],
          value: function(md) {
            return md`
We define the bricks as a 2D array of \`rows[columns]\`. Each brick has a position, a width and height, a point value, and a color. When bricks are destroyed by the ball, we set them to \`null\` in the nested array.
            `;
          }
        },
        {
          name: "bricks",
          inputs: [
            "newgame",
            "w",
            "scale",
            "eachBrick",
            "colors",
            "brickPoints"
          ],
          value: function(newgame, w, scale, eachBrick, colors, brickPoints) {
            newgame;

            const rows = 6,
              columns = Math.floor(w / 50);
            const padding = 3,
              top = 70;
            const width = (w - padding * (columns + 1) - scale * 2) / columns;

            let bricks = new Array(rows)
              .fill(1)
              .map(() => new Array(columns).fill(1));

            eachBrick(bricks, (b, row, col) => {
              bricks[row][col] = {
                w: width,
                h: scale,
                x: col * (width + padding) + padding + scale,
                y: row * (scale + padding) + top,
                color: colors[row],
                points: brickPoints[row]
              };
            });

            return bricks;
          }
        },
        {
          name: "colors",
          value: function() {
            return [
              "#c84848",
              "#c66c3a",
              "#b47a2f",
              "#a2a229",
              "#49a049",
              "#4348c8"
            ];
          }
        },
        {
          name: "brickPoints",
          value: function() {
            return [7, 7, 4, 4, 1, 1];
          }
        },
        {
          name: "eachBrick",
          value: function() {
            return function eachBrick(bricks, cb) {
              for (let row = 0; row < bricks.length; row++) {
                for (let col = 0; col < bricks[row].length; col++) {
                  let brick = bricks[row][col];
                  if (!brick) continue;
                  if (cb(brick, row, col)) return;
                }
              }
            };
          }
        },
        {
          name: "slider",
          from: "@jashkenas/inputs",
          remote: "slider"
        },
        {
          name: "button",
          from: "@jashkenas/inputs",
          remote: "button"
        },
        {
          inputs: ["md"],
          value: function(md) {
            return md`
_Thanks for the [Breakout tutorial](https://developer.mozilla.org/en-US/docs/Games/Tutorials/2D_Breakout_game_pure_JavaScript), Mozilla!_
            `;
          }
        }
      ]
    },
    {
      id: "@jashkenas/inputs",
      variables: [
        {
          name: "slider",
          inputs: ["input"],
          value: function(input) {
            return function slider(config = {}) {
              let {
                value,
                min = 0,
                max = 1,
                step = "any",
                precision = 2,
                title,
                description,
                submit
              } = config;
              if (typeof config == "number") value = config;
              if (value == null) value = (max + min) / 2;
              precision = Math.pow(10, precision);
              return input({
                type: "range",
                title,
                description,
                submit,
                attributes: { min, max, step, value },
                getValue: input =>
                  Math.round(input.valueAsNumber * precision) / precision
              });
            };
          }
        },
        {
          name: "button",
          inputs: ["input"],
          value: function(input) {
            return function button(config = {}) {
              let { value, title, description, disabled } = config;
              if (typeof config == "string") value = config;
              if (!value) value = "Ok";
              const form = input({
                type: "button",
                title,
                description,
                attributes: { disabled, value }
              });
              form.output.remove();
              return form;
            };
          }
        },
        {
          name: "input",
          inputs: ["html"],
          value: function(html) {
            return function input(config) {
              let {
                form,
                type = "text",
                attributes = {},
                action,
                getValue,
                title,
                description,
                submit,
                options
              } = config;
              if (!form)
                form = html`<form>
	<input name=input type=${type} />
  </form>`;
              const input = form.input;
              Object.keys(attributes).forEach(key => {
                const val = attributes[key];
                if (val != null) input.setAttribute(key, val);
              });
              if (submit)
                form.append(
                  html`<input name=submit type=submit style="margin: 0 0.75em" value="${
                    typeof submit == "string" ? submit : "Submit"
                  }" />`
                );
              form.append(
                html`<output name=output style="font: 14px Menlo, Consolas, monospace; margin-left: 0.5em;"></output>`
              );
              if (title)
                form.prepend(
                  html`<div style="font: 700 0.9rem sans-serif;">${title}</div>`
                );
              if (description)
                form.append(
                  html`<div style="font-size: 0.85rem; font-style: italic;">${description}</div>`
                );
              if (action) {
                action(form);
              } else {
                const verb = submit
                  ? "onsubmit"
                  : type == "button"
                    ? "onclick"
                    : type == "checkbox" || type == "radio"
                      ? "onchange"
                      : "oninput";
                form[verb] = e => {
                  e && e.preventDefault();
                  const value = getValue ? getValue(input) : input.value;
                  if (form.output) form.output.value = value;
                  form.value = value;
                  if (verb !== "oninput")
                    form.dispatchEvent(new CustomEvent("input"));
                };
                if (verb !== "oninput")
                  input.oninput = e =>
                    e && e.stopPropagation() && e.preventDefault();
                if (verb !== "onsubmit")
                  form.onsubmit = e => e && e.preventDefault();
                form[verb]();
              }
              return form;
            };
          }
        }
      ]
    }
  ]
};

export default notebook;
