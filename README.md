# minecraft-stronghold-locator
Triangulate your strongholds using Eye of Ender, <code>F3+C</code> (as of 1.13) and this easy to use web based tool.

Open https://ens-gijs.github.io/minecraft-stronghold-locator/ to get started.
All data entered is remembered by **your browser** for when you come back.
Your entries are never sent to, or stored by, any server.

About the author: My IGN is \_Ross\_\_ I play mostly on vanilla servers, feel free to say hi if you see me.
# Usage
## Instructions (Minecraft 1.13+)
### How to Triangulate a Stronghold
* Get yourself some Eyes of Ender and give them a throw.
* Aim your cross-hair at the eye as it floats in the sky and press C while holding F3 (<code>F3+C</code>).\
  _This uses a feature added in Minecraft 1.13 which will copy a teleport command to your clipboard._
* Paste the TP command into the web tool and move to a new location to throw another eye and repeat the process.\
  _Tip: move roughly perpendicular (at a right angle) to the direction the eye traveled._
* Once you have two or more rays entered into the tool you can DOUBLE-CLICK on the map (or anywhere you like for that matter).
  This will copy the map location you clicked to your clipboard. _Tip: if you hold ALT while double-clicking the NETHER coords will be copied to your clipboard_.

**To recap:**
1. Throw an Eye of Ender
2. Aim your cross-hairs at the eye as it floats and press F3+C
3. Paste the TP command into the web tool
4. Move some ways away and repeat 1, 2, & 3
5. Get close to where the rays cross and throw another eye and follow it to the Stronghold entrance.

> [!TIP] If you are a long ways from where the rays cross it can be helpful to first move to to a point 20-100 meters
> or so away from where the rays cross and roughly perpendicular to your existing rays. This will let you throw another
> eye and get a better estimate of where the Stronghold entrance is.

### To Drop a Marker
* Look straight up or down.
* Copy coords <code>F3+C</code>.
* Pase coords into the tool and the tool will draw a POINT for you.
* You can name the point by placing a line `!- Skelly Spanwer` above it.\
  _All points following a `!-` line will share the same name, naming stops at the first blank line._

### About the Rings on the Map
Strongholds are generated in rings, each ring contains UP TO a certain number of strongholds which will be spaced evenly within that ring. By placing a ***POINT*** within a ring the other approximate stronghold locations in that ring will be indicated by faint lines.

You can use this to more quickly locate another stronghold if the one you found had no portal room.

## Instructions (Minecraft 1.12.* and under)
Same as the instructions for 1.13+ except you will need to use the F3 screen and copy down the X, Z, and Facing values and enter them manually in the tool.
## Map
### Interacting with the Map
**Desktop:**
* Use mousewheel to zoom.
* Click and drag to pan.
* Double click to copy coords to the clipboard.\
  _Hold <code>ALT</code> while double-clicking to copy nether coords._

**Touch (phones / tablets):**
* Drag with one finger to pan.
* Pinch with two fingers to zoom.
* Double-tap to copy coords to the clipboard.
* The input panel slides up from a handle at the bottom of the screen.

### Inputs Panel
The triangulation inputs live in a side panel (desktop) or a bottom drawer (phones / tablets). The panel can be collapsed to give the map more room, and resized to fit your workflow.

- **Toggle (open / close):** click the small thumb tab on the edge or bottom of the panel.
- **Resize:** drag the thin handle at the panel's inside edge.
- **Persistence:** your collapsed/open state and chosen size are remembered across reloads. Sizes are kept as fixed pixel values and aren't rescaled when you resize the window — they're only clamped if a smaller window would push them past their bounds.
- **Reset View:** centers the map on world `(0, 0)`.

## Entering Data

### Comments
Lines beginning with -\- (two dashes) are ignored and can be used as comments.
```
-- This line would be ignored.
```
### Annotations
A line beginning with !\- will set the annotation of all following points until either a new annotation is set or until a blank line. Annotations will be shown in the map above the rendered point once zoomed sufficiently in.
```
!- Some Short Description
```
### Points
Points can be entered in the following ways.
```
X Z
X ~ Z
/tp X Y Z
```
_Do NOT include the Y coord, unless using the /tp format, you may use ~ in place of a Y value._

In Minecraft (1.13+) press **F3+C** _(Press C while holding F3 then release)_ while looking *STRAIT DOWN* and paste the TP command into the editor.
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