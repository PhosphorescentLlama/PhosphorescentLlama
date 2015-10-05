AudioContext.prototype.createKick = function( midiNote ) {

  /*

    GRAPH:

    kick.sub --> kick.sub.firstGain --> kick.sub.secondGain --> kick.master.gain --> destination
        ^                ^                      ^
        |                |                      |
        .frequency       .gain                  .gain
        ^                ^                      ^
        |                |                      |
        |                |                      * <-- kick.sub.secondGain.envelope
        |                |
        |                * <-- kick.sub.firstGain.whiteNoise.gain *
        |                                                         ^
        |                                                         |
        |                                                         * <-- kick.sub.firstGain.whiteNoise
        |
        * <-- kick.sub.frequency.envelope
  */

  // midiNote defaults to C2

  midiNote = midiNote || 36;

  var kick = {};

  var context = this;

  kick.master = {};

  kick.envelopes = [];

  var ms = Math.pow( 10, -3 );

  kick.sustain =  125 * ms;

  kick.master.gain = context.createGain( );

  kick.master.gain.gain.value = 0.5;

  kick.master.input = kick.master.gain;

  kick.master.output = kick.master.gain;

  // Create and configure kick.sub

  kick.sub = context.createOscillator( );

  kick.sub.type = 'sine';

  kick.sub.frequency.value = 440 * Math.pow( 2, ( midiNote - 12 - 69 ) / 12 );

  kick.sub.start( context.currentTime );

  // Create kick.sub.frequency.envelope

  kick.sub.frequency.envelope = {};

  kick.sub.frequency.envelope.attack = {

    time: 1 * ms,

    target: 440 * Math.pow( 2, ( midiNote + 24 - 69 ) / 12 ),

    initial: 440 * Math.pow( 2, ( midiNote + 22 - 69 ) / 12 )

  };

  kick.sub.frequency.envelope.decay =  200 * ms;

  kick.sub.frequency.envelope.sustain = 440 * Math.pow( 2, ( midiNote - 69 ) / 12 );

  kick.sub.frequency.envelope.release = {

    time: 250 * ms,

    target: 440 * Math.pow( 2, ( midiNote - 12 - 69 ) / 12 )

  };

  kick.sub.frequency.envelope = context.createEnvelope(

    kick.sub.frequency.envelope.attack,

    kick.sub.frequency.envelope.decay,

    kick.sub.frequency.envelope.sustain,

    kick.sub.frequency.envelope.release

  );

  kick.envelopes.push( kick.sub.frequency.envelope );

  /*

  kick.sub
      ^
      |
      .frequency
      ^
      |
      * <-- kick.sub.frequency.envelope

  */

  kick.sub.frequency.envelope.connect( kick.sub.frequency );

  // Create and configure kick.sub.firstGain

  kick.sub.firstGain = context.createGain( );

  kick.sub.firstGain.gain.value = 1;

  /*

  kick.sub --> kick.sub.firstGain

  */

  kick.sub.connect( kick.sub.firstGain );

  // Create and configure kick.sub.firstGain.whiteNoise

  kick.sub.firstGain.whiteNoise = context.createWhiteNoise( );

  // Create and configure kick.sub.firstGain.whiteNoise.gain

  kick.sub.firstGain.whiteNoise.gain = context.createGain( );

  kick.sub.firstGain.whiteNoise.gain.gain.value = 0.0005;

  /*

  kick.sub.firstGain.whiteNoise.gain *
                                     ^
                                     |
                                     * <-- kick.sub.firstGain.whiteNoise

  */

  kick.sub.firstGain.whiteNoise.connect( kick.sub.firstGain.whiteNoise.gain );

  kick.sub.firstGain.whiteNoise.start( context.currentTime );

  /*

  kick.sub.firstGain
          ^
          |
          .gain
          ^
          |
          * <-- kick.sub.firstGain.whiteNoise.gain

  */

  kick.sub.firstGain.whiteNoise.gain.connect( kick.sub.firstGain );

  // Create and configure kick.sub.secondGain

  kick.sub.secondGain = context.createGain( );

  kick.sub.secondGain.gain.value = 0;

  /*

  kick.sub.firstGain --> kick.sub.secondGain

  */

  kick.sub.firstGain.connect( kick.sub.secondGain );

  /*

  kick.sub.secondGain --> kick.sub.master.gain

  */

  kick.sub.secondGain.connect( kick.master.input );

  // Create and configure kick.sub.secondGain.envelope

  kick.sub.secondGain.envelope = {};

  kick.sub.secondGain.envelope.attack = 1 * ms;

  kick.sub.secondGain.envelope.decay = 200 * ms;

  kick.sub.secondGain.envelope.sustain = 0.25;

  kick.sub.secondGain.envelope.release = 250 * ms;

  kick.sub.secondGain.envelope = context.createEnvelope(

    kick.sub.secondGain.envelope.attack,

    kick.sub.secondGain.envelope.decay,

    kick.sub.secondGain.envelope.sustain,

    kick.sub.secondGain.envelope.release

  );

  kick.envelopes.push( kick.sub.secondGain.envelope );

  /*

  kick.sub.secondGain
          ^
          |
          .gain
          ^
          |
          * <-- kick.sub.secondGain.envelope

  */

  kick.sub.secondGain.envelope.connect( kick.sub.secondGain.gain );

  // Implement connect and start interface.

  kick.connect = function( destination ) {

    if( destination.hasOwnProperty( 'input' ) ) {

      kick.master.output.connect( destination.input );

    } else {

      kick.master.output.connect( destination );

    }

  };

  kick.start = function( when ) {

    kick.envelopes.forEach( function( envelope ) {

      envelope.on( when, kick.sustain );

    });

  };

  return kick;
  
};