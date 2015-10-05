AudioContext.prototype.createClosedHat = function( ) {

  /*

  GRAPH:

  closedHat.noise --> closedHat.noise.filter --> closedHat.noise.gain --> closedHat.master.gain --> destination
                                     ^                          ^
                                     |                          |
                                     .frequency                 .gain
                                     ^                          ^
                                     |                          |
                                     |                          * <-- closedHat.noise.gain.envelope
                                     |
                                     * <-- closedHat.noise.filter.frequency.envelope

  */

  var context = this;

  var closedHat = {};

  ms = Math.pow( 10, -3 );

  closedHat.duration = 75 * ms;

  closedHat.sustain = 0;

  closedHat.envelopes = [];

  closedHat.master = {};

  // Create and configure closedHat.master.gain

  closedHat.master.gain = context.createGain( );

  closedHat.master.gain.gain.value = 4;

  closedHat.master.input = closedHat.master.gain;

  closedHat.master.output = closedHat.master.gain;

  // Create and configure closedHat.noise

  closedHat.noise = context.createWhiteNoise( );

  // Create and configure closedHat.noise.filter

  closedHat.noise.filter = context.createBiquadFilter( );

  closedHat.noise.filter.type = 'bandpass';

  closedHat.noise.filter.Q.value = 10;

  closedHat.noise.filter.frequency.value = 9000;

  /*

  closedHat.noise --> closedHat.noise.filter

  */

  closedHat.noise.connect( closedHat.noise.filter );

  closedHat.noise.start( context.currentTime );

  // Create and configure closedHat.noise.filter.frequency.envelope

  closedHat.noise.filter.frequency.envelope = {};

  closedHat.noise.filter.frequency.envelope.attack = {

    time: closedHat.duration * ( 1 / 100 ),

    target: 9500,

    initial: 9000

  };

  closedHat.noise.filter.frequency.envelope.decay =

    closedHat.duration *  ( 99 / 100 );

  closedHat.noise.filter.frequency.envelope.sustain = 9000;

  closedHat.noise.filter.frequency.envelope.release = 0;

  closedHat.noise.filter.frequency.envelope = context.createEnvelope(

    closedHat.noise.filter.frequency.envelope.attack,

    closedHat.noise.filter.frequency.envelope.decay,

    closedHat.noise.filter.frequency.envelope.sustain,

    closedHat.noise.filter.frequency.envelope.release

  );

  closedHat.envelopes.push( closedHat.noise.filter.frequency.envelope );

  /*

  closedHat.noise.filter
                 ^
                 |
                 .frequency
                 ^
                 |
                 * <-- closedHat.noise.filter.frequency.envelope

  */

  closedHat.noise.filter.frequency.envelope.

    connect( closedHat.noise.filter.frequency );

  // Create and configure closedHat.noise.gain

  closedHat.noise.gain = context.createGain( );

  closedHat.noise.gain.gain.value = 0;

  /*

  closedHat.noise.filter --> closedHat.noise.gain

  */

  closedHat.noise.filter.connect( closedHat.noise.gain );

  // Create and configure closedHat.noise.gain.envelope

  closedHat.noise.gain.envelope = {};

  closedHat.noise.gain.envelope.attack =

    closedHat.duration * ( 2 / 70 );

  closedHat.noise.gain.envelope.decay =

    closedHat.duration * ( 68 / 70 );

  closedHat.noise.gain.envelope.sustain = 0;

  closedHat.noise.gain.envelope.release = 0;

  closedHat.noise.gain.envelope = context.createEnvelope(

    closedHat.noise.gain.envelope.attack,

    closedHat.noise.gain.envelope.decay,

    closedHat.noise.gain.envelope.sustain,

    closedHat.noise.gain.envelope.release

  );

  closedHat.envelopes.push( closedHat.noise.gain.envelope );

  /*

  closedHat.noise.gain
                 ^
                 |
                 .gain
                 ^
                 |
                 * <-- closedHat.noise.gain.envelope

  */

  closedHat.noise.gain.envelope.connect( closedHat.noise.gain.gain );

  /*

  closedHat.noise.gain --> closedHat.master.gain

  */

  closedHat.noise.gain.connect( closedHat.master.input );

  // Provide connect and start methods.

  closedHat.connect = function( destination ) {

    if( destination.hasOwnProperty( 'input' ) ) {

      closedHat.master.output.connect( destination.input );

    } else {

      closedHat.master.output.connect( destination );

    }

  };

  closedHat.start = function( when ) {

    closedHat.envelopes.forEach( function( envelope ) {

      envelope.on( when, closedHat.sustain );

    });

  };


  return closedHat;

};