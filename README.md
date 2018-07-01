# minecraft-stronghold-locator
Triangulate your strongholds using Eye of Ender, F3+C (as of 1.13) and this easy to use web based tool.

Open https://ens-gijs.github.io/minecraft-stronghold-locator/ to get started.
All data entered is remembered by **your browser** for when you come back.
Your  entries are never sent to, or stored by, any server.

About the author: My IGN is \_Ross\_\_ I play mostly on vanilla servers, feel free to say hi if you see me.
# Usage
## Instructions (Minecraft 1.13+)
Get yourself some Eyes of Ender and give them a throw. Aim your cross hair at the eye as it floats in the sky and press C while holding F3 (F3+C). This uses a feature added in Minecraft 1.13 which will copy a teleport command to your clipboard. Paste the TP command into the web tool and move to a new location to throw another eye and repeat the process _(Tip: move roughly perpendicular (at a right angle) to the direction the eye traveled)_. Once you have two or more rays entered in the tool you can DOUBLE CLICK on the map (or anywhere you like for that matter). This will copy the map location you clicked to your clipboard _(Tip: if you hold ALT while double clicking the NETHER coords will be copied to your clipboard)_. It can sometimes be helpful to also paste this copied coord into the tool and the tool will draw a POINT for you. If you are a long ways from where the rays cross it can be helpful to first move to to a point 20-100 meters or so away from where the rays cross and roughly perpendicular to your existing rays. This will let you throw another eye and get a better estimate of where the Stronghold entrance is.

**To recap:**
1. Throw an Eye of Ender
2. Aim your cross hairs at the eye as it floats and press F3+C
3. Paste the TP command into the web tool
4. Move some ways away and repeat 1, 2, & 3
5. Get close to where the rays cross and throw another eye and follow it to the Stronghold entrance.

## Instructions (Minecraft 1.12.* and under)
Same as the instructions for 1.13+ except you will need to use the F3 screen and copy down the X, Z, and Facing values and enter them manually in the tool.
## Map
### Interacting with the Map
Use mousewheel to zoom.
Click and drag to Pan.

Double click on the map to copy coords to the clipboard. **Hold ALT** while double  clicking to copy nether coords.

### About the Rings on the Map
Strongholds are generated in rings, each ring contains UP TO a certain number of strongholds which will be spaced evenly within that ring. By placing a ***POINT*** within a ring the other approximate stronghold locations in that ring will be indicated by faint lines.

You can use this to more quickly locate another stronghold if the one you found had no portal room.

## Entering Data

### Comments
Lines beginning with -\- (two dashes) are ignored and can be used as comments.
```
-- This line would be ignored.
```
### Points
Points can be entered in the following ways.
```
X Z
X ~ Z
```
_Do NOT include the Y coord, you may use ~ in place of a Y value._

In Minecraft (1.13+) press **F3+C** _(Press C while holding F3 then release)_ while  looking *STRAIT DOWN* and paste the TP command into the editor.
```
/execute in overworld run tp @s -8839.15 69.00 -4709.39 115.29 90.00
```
### Rays
Rays can be entered in the following ways
```
X Z Facing
```
In Minecraft (1.13+) press F3+C while  looking *IN A DIRECTION* and paste the TP command into the editor.
```
/execute in overworld run tp @s -9237.95 90.00 -5091.29 -1334.01 -31.06
```

### Using Nether Coords
Nether coords are plotted scaled for the overworld. TP commands which were captured from the nether will be detected automatically. Manually entered Points and Rays may be followed by a space and the letter N to indicate that they should be treated as a nether cord.
For example: 200 ~ 100 N

### Using Colors
Points and Rays can be colored. Set the active color by using a line beginning with the **#** character followed by a color name _(there may be zero or more spaces between the # and the color)_. All points and rays which follow will use this color until the color is changed. If an invalid color is specified the default color BLACK is used.
```
#SteelBlue
7554 -2459 146.8
7622 -2591 142
7423 -3108 134.8

#Blue
6564 ~ -3947

#DarkOrchid
/execute in overworld run tp @s -8839.15 69.00 -4709.39 115.29 -29.79
/execute in overworld run tp @s -9237.95 90.00 -5091.29 -1334.01 -31.06

#Magenta
-1284 ~ -673 N
```

#### Sample Colors
See the Wikipedia page on [web colors](https://en.wikipedia.org/wiki/Web_colors#X11_color_names) for a conclusive list, here are some samples for your convenience.
```
#SteelBlue
#Blue
#DarkOrchid
#Magenta
#MediumSpringGreen
#Orange
#DeepPink
#SlateBlue
#Lime
```
Other CSS color specifiers are also valid.
```
# rgb(255,128,0)
# hsl(220, 60%, 70%)
```