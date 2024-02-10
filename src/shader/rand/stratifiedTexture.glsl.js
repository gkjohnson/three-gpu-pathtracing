export const stratifiedTextureGLSL = /* glsl */`

	uniform sampler2D stratifiedTexture;
	uniform sampler2D stratifiedOffsetTexture;

	uint sobolPixelIndex = 0u;
	uint sobolPathIndex = 0u;
	uint sobolBounceIndex = 0u;
	float pixelSeed = 0.0;
	uvec4 WHITE_NOISE_SEED;

	// TODO: remove pcg functions here
	void pcg4d( inout uvec4 v ) {

		v = v * 1664525u + 1013904223u;
		v.x += v.y * v.w;
		v.y += v.z * v.x;
		v.z += v.x * v.y;
		v.w += v.y * v.z;
		v = v ^ ( v >> 16u );
		v.x += v.y*v.w;
		v.y += v.z*v.x;
		v.z += v.x*v.y;
		v.w += v.y*v.z;

	}

	// returns [ 0, 1 ]
	float pcgRand() {

		pcg4d( WHITE_NOISE_SEED );
		return float( WHITE_NOISE_SEED.x ) / float( 0xffffffffu );

	}

	vec4 sobol4( int v ) {

		vec4 stratifiedSample = texelFetch( stratifiedTexture, ivec2( v, sobolBounceIndex ), 0 );
		return fract( stratifiedSample + pixelSeed ); // blue noise + stratified samples

	}

	vec3 sobol3( int v ) {

		return sobol4( v ).xyz;

	}

	vec2 sobol2( int v ) {

		return sobol4( v ).xy;

	}

	float sobol( int v ) {

		return sobol4( v ).x;

	}

	void rng_initialize( vec2 screenCoord, int frame ) {

		WHITE_NOISE_SEED = uvec4( screenCoord, uint( frame ), uint( screenCoord.x ) + uint( screenCoord.y ) );

		// tile the small noise texture across the entire screen
		ivec2 noiseSize = ivec2( textureSize( stratifiedOffsetTexture, 0 ) );
		pixelSeed = texelFetch( stratifiedOffsetTexture, ivec2( screenCoord.xy ) % noiseSize, 0 ).r;

	}

`;
