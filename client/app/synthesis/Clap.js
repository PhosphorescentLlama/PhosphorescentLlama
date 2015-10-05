AudioContext.prototype.createClap = function( ) {

  /*

  GRAPH:

  clap.noise --> clap.noise.gain --> clap.noise.filter ---------------------------------------------> *
                           ^                   ^                                                      |
                           |                   |                                                      |
                           .gain               .frequency <-- clap.noise.filter.frequency.envelope    |
                           ^                                                                          |
                           |                                                                          |
                           * <-- clap.noise.gain.envelope                                             |
                                                                                                      v
                                      * clap.noise.notch3 <-- clap.noise.notch2 <-- clap.noise.notch1 *
                                      |
                                      v
                                      * --> clap.master.gain --> destination  
  */

  var context = this;

  var clap = {};

  clap.envelopes = [];

  var ms = Math.pow( 10, -3 );

  clap.sustain = 15 * ms;

  clap.master = {};

  clap.master.gain = context.createGain( );

  clap.master.gain.gain.value = 0.6;

  clap.master.input = clap.master.gain;

  clap.master.output = clap.master.gain;

  // Create and configure clap.noise

  clap.noise = context.createWhiteNoise( );

  // Create and configure clap.noise.gain

  clap.noise.gain = context.createGain( );

  clap.noise.gain.gain.value = 0;

  /*

  clap.noise --> clap.noise.gain

  */

  clap.noise.connect( clap.noise.gain );

  clap.noise.start( context.currentTime );

  // Create and configure clap.noise.gain.envelope

  clap.noise.gain.envelope = {};

  clap.noise.gain.envelope.attack = 4.2 * ms;

  clap.noise.gain.envelope.decay = 58 * ms;

  clap.noise.gain.envelope.sustain = 0.015;

  clap.noise.gain.envelope.release = 300 * ms;

  clap.noise.gain.envelope = context.createEnvelope(

    clap.noise.gain.envelope.attack,

    clap.noise.gain.envelope.decay,

    clap.noise.gain.envelope.sustain,

    clap.noise.gain.envelope.release

  );

  clap.envelopes.push( clap.noise.gain.envelope );

  /*

  clap.noise.gain
            ^
            |
            .gain
            ^
            |
            * <-- clap.noise.gain.envelope

  */

  clap.noise.gain.envelope.connect( clap.noise.gain.gain );

  // Create and configure clap.noise.filter

  clap.noise.filter = context.createBiquadFilter( );

  clap.noise.filter.type = 'lowpass';

  clap.noise.filter.frequency = 7500;

  /*

  clap.noise.gain --> clap.noise.filter

  */

  clap.noise.gain.connect( clap.noise.filter );

  // Create and configure clap.noise.filter.frequency.envelope

  clap.noise.filter.frequency.envelope = {};

  clap.noise.filter.frequency.envelope.attack = {

    time: 0 * ms,

    target: 10000,

    initial: 7500

  };

  clap.noise.filter.frequency.envelope.decay = 282.2 * ms;

  clap.noise.filter.frequency.envelope.sustain = 7500;

  clap.noise.filter.frequency.envelope.release = {

    time: 0 * ms,

    target: 7500

  };

  clap.noise.filter.frequency.envelope = context.createEnvelope(

    clap.noise.filter.frequency.envelope.attack,

    clap.noise.filter.frequency.envelope.decay,

    clap.noise.filter.frequency.envelope.sustain,

    clap.noise.filter.frequency.envelope.release

  );

  clap.envelopes.push( clap.noise.filter.frequency.envelope );

  /*

  clap.noise.filter
            ^
            |
            .frequency
            ^
            |
            * <-- clap.noise.filter.frequency.envelope

  */

  clap.noise.filter.frequency.envelope.connect( clap.noise.filter.frequency );

  // Create and configure clap.noise.notch1

  clap.noise.notch1 = context.createBiquadFilter( );

  clap.noise.notch1.type = 'peaking';

  clap.noise.notch1.Q.value = 0.64;

  clap.noise.notch1.frequency.value = 250;

  clap.noise.notch1.gain.value = -10;

  /*

  clap.noise.filter --> clap.noise.notch1

  */

  clap.noise.filter.connect( clap.noise.notch1 );

  // Create and configure clap.noise.notch2

  clap.noise.notch2 = context.createBiquadFilter( );

  clap.noise.notch2.type = 'peaking';

  clap.noise.notch2.Q.value = 0.71;

  clap.noise.notch2.frequency.value = 1000;

  clap.noise.notch2.gain.value = 25;

  /*

  clap.noise.notch1 --> clap.noise.notch2

  */

  clap.noise.notch1.connect( clap.noise.notch2 );

  // Create and configure clap.noise.notch3

  clap.noise.notch3 = context.createBiquadFilter( );

  clap.noise.notch3.type = 'peaking';

  clap.noise.notch3.Q.value = 0.39;

  clap.noise.notch3.frequency.value = 7300;

  clap.noise.notch3.gain.value = -1;

  /*

  clap.noise.notch2 --> clap.noise.notch3

  */

  clap.noise.notch2.connect( clap.noise.notch3 );

  /*

  clap.noise.notch3 --> clap.master.gain

  */

  clap.noise.notch3.connect( clap.master.input );

  // Implement clap.connect and clap.start

  clap.connect = function ( destination ) {

    if( destination.hasOwnProperty( 'input' ) ) {

      clap.master.output.connect( destination.input );

    } else {

      clap.master.output.connect( destination );

    }

  };

  clap.start = function( when ) {

    clap.envelopes.forEach( function( envelope ) {

      envelope.on( when, clap.sustain );

    });

  };

  return clap;

};