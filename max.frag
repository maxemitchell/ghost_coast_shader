// Author: @patriciogv
// Title: Simple Voronoi

#ifdef GL_ES
precision mediump float;
#endif

#define SCALE 50.

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;
uniform float u_amp;
uniform float u_fft0;
uniform float u_fft1;
uniform float u_fft2;
uniform float u_fft3;
uniform float u_fft4;
uniform float u_fft5;
uniform float u_fft6;
uniform float u_fft7;


float circle(in vec2 _st, in vec2 _pos, in float _radius){
    vec2 dist = _st-_pos;
	return 1.-smoothstep(_radius-(_radius*0.8),
                         _radius+(_radius*.2),
                         dot(dist,dist)*4.0);
}

vec2 random2( vec2 p ) {
    return fract(sin(vec2(dot(p,vec2(219.532+(cos(u_fft0)*.02),8.828+(sin(u_fft0)*.01))),dot(p,vec2(75.5+(sin(u_fft0)*.5),741.3))))*(.5453+sin(u_fft0)*.4));
}

float random (in vec2 _st) {
    return fract(sin(dot(_st.xy,
                         vec2(75.9898,78.233)))*
        43758.5453123);
}

// Based on Morgan McGuire @morgan3d
// https://www.shadertoy.com/view/4dS3Wd
float noise (in vec2 _st) {
    vec2 i = floor(_st);
    vec2 f = fract(_st);

    // Four corners in 2D of a tile
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(a, b, u.x) +
            (c - a)* u.y * (1.0 - u.x) +
            (d - b) * u.x * u.y;
}

#define NUM_OCTAVES 10

float fbm ( in vec2 _st) {
    float v = 0.0;
    float a = 0.5;
    vec2 shift = vec2(100.0);
    // Rotate to reduce axial bias
    mat2 rot = mat2(cos(0.5), sin(0.5),
                    -sin(0.5), cos(0.50));
    for (int i = 0; i < NUM_OCTAVES; ++i) {
        v += a * noise(_st);
        _st = rot * _st * 2.0 + shift;
        a *= 0.5;
    }
    return v;
}


void main() {
    vec2 st = gl_FragCoord.xy/u_resolution.xy;
    st.x *= u_resolution.x/u_resolution.y;
    vec3 color = vec3(1.0);
    
    //fBm background
    
    vec2 q = vec2(0.);
    q.x = fbm( st + 0.01*u_time);
    q.y = fbm( st + vec2(0.5, 1.0));

    vec2 r = vec2(0.);
    r.x = fbm( st + 0.5*q + vec2(1.7,9.2)+ 0.15*u_time );
    r.y = fbm( st + 0.9*q + vec2(8.3,2.8)+ 0.126*u_time);

    float f = fbm(st+r);

    vec3 color1 = mix(vec3(0.1922, 0.5804, 0.6314), vec3(0.1176, 0.1294, 0.8549), u_fft0);
    vec3 color2 = mix(vec3(0.1647, 0.6118, 0.4627), vec3(0.9529, 0.0706, 0.8353), u_fft0);


    color = mix(color1,
                color2,
                clamp((f*f)*4.0,0.0,1.0));

    color = mix(color,
                vec3(0.5059, 0.8078, 0.902),
                clamp(length(q),0.0,1.0));

    color = mix(color,
                vec3(0.9216, 0.3686, 0.8745),
                clamp(length(r.x),0.0,1.0));

    vec3 colorfBm = vec3((f*f*f+.6*f*f+.9*f)*color);
    
    // Scale
    st *= SCALE;

    // Tile the space
    vec2 i_st = floor(st);
    vec2 f_st = fract(st);

    float m_dist = 10.;  // minimum distance
    vec2 m_point;        // minimum point

    for (int j=-1; j<=1; j++ ) {
        for (int i=-1; i<=1; i++ ) {
            vec2 neighbor = vec2(float(i),float(j));
            vec2 point = random2(i_st + neighbor);
            point = 0.5 + 0.5*sin(u_time*3. + 18.927*point);
            vec2 diff = neighbor + point - f_st;
            float dist = length(diff);

            if( dist < m_dist ) {
                m_dist = dist;
                m_point = point;
            }
        }
    }

    // Assign a color using the closest point position
    color -= dot(m_point,vec2(-0.700+sin(u_time*.3)*.5,cos(u_time*.1)*.5));

    // Add distance field to closest point center
    // color.gr /= m_point*3.608;
    
    // Limit the design to a center circle that breaths
    st /= SCALE;
    // float circles = circle(st, vec2(0.5, 0.5), 0.65+(sin(u_time*1.0)*.05));
    float circles = circle(st, vec2(0.5, 0.5), 0.2+u_amp*0.5);
    // circles += circle(st, vec2(0.85,0.85), 0.1+u_fft1*.1);
    // circles += circle(st, vec2(0.15,0.15), 0.1+u_fft2*.1);
    // circles += circle(st, vec2(0.85,0.15), 0.1+u_fft3*.1);
    // circles += circle(st, vec2(0.15,0.85), 0.1+u_fft4*.1);
    color *= circles;

    // Draw cell center
    // color += 1.-smoothstep(0.41, 0.4, m_dist);

    // Add fBm background
	colorfBm *= vec3(0.0, 1.0, 0.7843) - vec3(circles);
	color += colorfBm;

    // Add color reaction from musi
    
    gl_FragColor = vec4(color,1.0);
}
