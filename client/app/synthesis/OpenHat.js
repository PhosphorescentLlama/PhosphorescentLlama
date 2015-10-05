AudioContext.prototype.createOpenHat = function( ) {

  /*

  GRAPH:
                                 * <-- openHat.noise.filter.Q.modulator.gain *
                                 |                                           ^
                                 v                                           |
                                 .Q                                          * <-- openHat.filter.Q.modulator
                                 | 
                                 v
  openHat.noise --> openHat.noise.filter --> openHat.noise.gain --> openHat.master.gain --> destination
                                 ^                        ^
                                 |                        |
                                 .frequency               .gain
                                 ^                        ^
                                 |                        |
                                 |                        * <-- openHat.noise.gain.envelope
                                 |
                                 * <-- openHat.noise.filter.frequency.envelope

  */

  var context = this;

  var openHat = {};

  ms = Math.pow( 10, -3 );

  openHat.duration = 250 * ms;

  openHat.sustain = 0;

  openHat.envelopes = [];

  openHat.master = {};

  // Create and configure openHat.master.gain

  openHat.master.gain = context.createGain( );

  openHat.master.gain.gain.value = 2;

  openHat.master.input = openHat.master.gain;

  openHat.master.output = openHat.master.gain;

  // Create and configure openHat.noise

  openHat.noise = context.createWhiteNoise( );

  // Create and configure openHat.noise.filter

  openHat.noise.filter = context.createBiquadFilter( );

  openHat.noise.filter.type = 'bandpass';

  openHat.noise.filter.Q.value = 10;

  openHat.noise.filter.frequency.value = 9000;

  /*

  openHat.noise --> openHat.noise.filter

  */

  openHat.noise.connect( openHat.noise.filter );

  openHat.noise.start( context.currentTime );

  // Create and configure openHat.noise.filter.frequency.envelope

  openHat.noise.filter.frequency.envelope = {};

  openHat.noise.filter.frequency.envelope.attack = {

    time: openHat.duration * ( 1 / 100 ),

    target: 9500,

    initial: 9000

  };

  openHat.noise.filter.frequency.envelope.decay =

    openHat.duration *  ( 99 / 100 );

  openHat.noise.filter.frequency.envelope.sustain = 9000;

  openHat.noise.filter.frequency.envelope.release = 0;

  openHat.noise.filter.frequency.envelope = context.createEnvelope(

    openHat.noise.filter.frequency.envelope.attack,

    openHat.noise.filter.frequency.envelope.decay,

    openHat.noise.filter.frequency.envelope.sustain,

    openHat.noise.filter.frequency.envelope.release

  );

  openHat.envelopes.push( openHat.noise.filter.frequency.envelope );

  /*

  openHat.noise.filter
                 ^
                 |
                 .frequency
                 ^
                 |
                 * <-- openHat.noise.filter.frequency.envelope

  */

  openHat.noise.filter.frequency.envelope.

    connect( openHat.noise.filter.frequency );

  // Create and configure openHat.noise.filter.Q.modulator

  openHat.noise.filter.Q.modulator = context.createOscillator( );

  openHat.noise.filter.Q.modulator.frequency.value = 880;

  openHat.noise.filter.Q.modulator.type = 'sawtooth';

  openHat.noise.filter.Q.modulator.start( context.currentTime );

  // Create and configure openHat.noise.filter.Q.modulator.gain

  openHat.noise.filter.Q.modulator.gain = context.createGain( );

  openHat.noise.filter.Q.modulator.gain.gain.value = 5.5;

  /*

  openHat.noise.filter.Q.modulator.gain *
                                        ^
                                        |
                                        * <-- openHat.noise.filter.Q.modulator

  */

  openHat.noise.filter.Q.modulator.

    connect( openHat.noise.filter.Q.modulator.gain );

  /*

               * openHat.noise.filter.Q.modulator.gain
               |
               v
               .Q
               |
               v
  openHat.noise.filter

  */

  openHat.noise.filter.Q.modulator.gain.

    connect( openHat.noise.filter.Q );

  // Create and configure openHat.noise.gain

  openHat.noise.gain = context.createGain( );

  openHat.noise.gain.gain.value = 0;

  /*

  openHat.noise.filter --> openHat.noise.gain

  */

  openHat.noise.filter.connect( openHat.noise.gain );

  // Create and configure openHat.noise.gain.envelope

  openHat.noise.gain.envelope = {};

  openHat.noise.gain.envelope.attack =

    openHat.duration * ( 1 / 250 );

  openHat.noise.gain.envelope.decay =

    openHat.duration * ( 249 / 250 );

  openHat.noise.gain.envelope.sustain = 0;

  openHat.noise.gain.envelope.release = 0;

  openHat.noise.gain.envelope = context.createEnvelope(

    openHat.noise.gain.envelope.attack,

    openHat.noise.gain.envelope.decay,

    openHat.noise.gain.envelope.sustain,

    openHat.noise.gain.envelope.release

  );

  openHat.envelopes.push( openHat.noise.gain.envelope );

  /*

  openHat.noise.gain
                 ^
                 |
                 .gain
                 ^
                 |
                 * <-- openHat.noise.gain.envelope

  */

  openHat.noise.gain.envelope.connect( openHat.noise.gain.gain );

  /*

  openHat.noise.gain --> openHat.master.gain

  */

  openHat.noise.gain.connect( openHat.master.input );

  // Provide connect and start methods.

  openHat.connect = function( destination ) {

    if( destination.hasOwnProperty( 'input' ) ) {

      openHat.master.output.connect( destination.input );

    } else {

      openHat.master.output.connect( destination );

    }

  };

  openHat.start = function( when ) {

    openHat.envelopes.forEach( function( envelope ) {

      envelope.on( when, openHat.sustain );

    });

  };


  return openHat;
};