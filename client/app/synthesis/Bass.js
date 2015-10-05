AudioContext.prototype.createBass = function( midiNote ) {

  /*

  GRAPH:

  bass.sub --> bass.sub.gain --> * --> bass.master.gain --> destination
      |                |         ^
      .frequency       .gain
      ^                ^
      |                |
      |                * <-- bass.sub.gain.envelope
      |
      * <-- bass.sub.frequency.modulator.gain <-- bass.sub.frequency.modulator
                                        ^
                                        |
                                        .gain
                                        ^
                                        |
                                        * <-- bass.sub.frequency.modulator.gain.envelope

  */

  // If midiNote is note provided, it defaults to C1

  midiNote = midiNote || 24;

  var context = this;

  var bass = {};

  bass.duration = 0.5;

  bass.sustain =  bass.duration * ( 2 / 5 );

  bass.envelopes = [];

  bass.master = {};

  // create and configure bass.master.gain

  bass.master.gain = context.createGain( );

  bass.master.gain.gain.value = 0.25;

  bass.master.input = bass.master.gain;

  bass.master.output = bass.master.gain;

  // create and configure bass.sub

  bass.sub = context.createOscillator( );

  bass.sub.type = 'sine'; // /\/\/\

  bass.sub.frequency.value = 440 * Math.pow( 2, ( midiNote - 69 ) / 12 );

  bass.sub.start( context.currentTime );

  // create and configure bass.sub.frequency.modulator

  bass.sub.frequency.modulator = context.createOscillator( );

  bass.sub.frequency.modulator.type = 'sine';

  bass.sub.frequency.modulator.frequency.value = 440 * Math.pow( 2, ( midiNote + 24 - 69 ) / 12 );

  bass.sub.frequency.modulator.start( context.currentTime );

  // create and configure bass.sub.frequency.modulator.gain

  bass.sub.frequency.modulator.gain = context.createGain( );

  bass.sub.frequency.modulator.gain.gain.value = 0;

  /*

  bass.sub.frequency.modulator.gain <-- bass.sub.frequency.modulator

  */

  bass.sub.frequency.modulator.connect( bass.sub.frequency.modulator.gain );

  /*

  bass.sub
      ^
      |
      .frequency
      ^
      |
      * <-- bass.sub.frequency.modulator.gain

  */

  bass.sub.frequency.modulator.gain.connect( bass.sub.frequency );

  // Create and configure bass.sub.frequency.modulator.gain.envelope

  bass.sub.frequency.modulator.gain.envelope = {};

  bass.sub.frequency.modulator.gain.envelope.attack = {

    time: bass.duration * ( 2.5 / 5 ),

    target: 10 * 440 * Math.pow( 2, ( midiNote - 69 ) / 12 ),

    initial: 0

  };

  bass.sub.frequency.modulator.gain.envelope.decay = bass.duration * ( 0.5 / 5 );

  bass.sub.frequency.modulator.gain.envelope.sustain = 440 * Math.pow( 2, ( midiNote - 69 ) / 12 );

  bass.sub.frequency.modulator.gain.envelope.release = 0;

  bass.sub.frequency.modulator.gain.envelope = context.createEnvelope(

    bass.sub.frequency.modulator.gain.envelope.attack,

    bass.sub.frequency.modulator.gain.envelope.decay,

    bass.sub.frequency.modulator.gain.envelope.sustain,

    bass.sub.frequency.modulator.gain.envelope.release

  );

  bass.envelopes.push( bass.sub.frequency.modulator.gain.envelope );

  /*

  bass.sub.frequency.modulator.gain
                              ^
                              |
                              .gain
                              ^
                              |
                              * <-- bass.sub.frequency.modulator.gain.envelope

  */

  bass.sub.frequency.modulator.gain.envelope.

    connect( bass.sub.frequency.modulator.gain.gain );

  // Create and configure bass.sub.gain

  bass.sub.gain = context.createGain( );

  bass.sub.gain.gain.value = 0;

  /*

  bass.sub --> bass.sub.gain

  */

  bass.sub.connect( bass.sub.gain );


  /*

  bass.sub.gain --> bass.master.gain

  */

  bass.sub.gain.connect( bass.master.input );

  // Create and configure bass.sub.gain.envelope

  bass.sub.gain.envelope = {};

  bass.sub.gain.envelope.attack = bass.duration * ( 1.5 / 5 );

  bass.sub.gain.envelope.decay = bass.duration * ( 0.5 / 5 );

  bass.sub.gain.envelope.sustain = 0.25;

  bass.sub.gain.envelope.release = bass.duration * ( 1 / 5 );

  bass.sub.gain.envelope = context.createEnvelope(

    bass.sub.gain.envelope.attack,

    bass.sub.gain.envelope.decay,

    bass.sub.gain.envelope.sustain,

    bass.sub.gain.envelope.release

  );

  bass.envelopes.push( bass.sub.gain.envelope );

  /*

  bass.sub.gain
          ^
          |
          .gain
          ^
          |
          * <-- bass.sub.gain.envelope

  */

  bass.sub.gain.envelope.connect( bass.sub.gain.gain );

  bass.connect = function( destination ) {

    /*

    bass.master.gain --> destination

    */

    if( destination.hasOwnProperty( 'input' ) ) {

      bass.master.output.connect( destination.input );

    } else {

      bass.master.output.connect( destination );

    }

  };

  bass.start = function( when ) {

    bass.envelopes.forEach( function( envelope ) {

      envelope.on( when, bass.sustain );

    });

  };

  return bass;

};