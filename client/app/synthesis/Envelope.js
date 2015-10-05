AudioContext.prototype.createEnvelope =

  function( attack, decay, sustain, release ) {

  var context = this;

  // attack = 

  //  { time: ...,

  //    target: ... 

  //  } || attackTime, where target defaults to 1.

  // decay = decayTime

  // sustain = sustainTarget

  // release =

  //  { time: ...,

  //    target: ...

  //  } || releaseTime, where target defaults to Math.pow( 10, -100 )

  var envelope = {};

  // check if inputs conform to

  // interface.

  envelope.setAttack = function( attack ) {

    if( typeof attack !== 'number' ) {

      if( typeof attack === 'object' ) {

        if(

          typeof attack.time !== 'number' ||

          attack.time < 0

        ) {

          throw "Attack should have a property 'time' that references a positive number.";

        } else if(

          attack.initial !== undefined &&

          typeof attack.initial !== 'number'

        ) {

          throw "If initial is defined, inital must reference a number.";

        } else if(

          attack.target !== undefined &&

          typeof attack.target !== 'number'

        ) {

          throw "If target is defined, target must reference a number.";

        } else if(

          attack.target !== undefined &&

          envelope.sustain !== undefined &&

          attack.target < envelope.sustain

        ) {

          throw "The attack's target must be greater than the envelope's sustain.";

        } else if(

          attack.target === undefined &&

          envelope.sustain !== undefined &&

          envelope.sustain > 1

        ) {

          throw "The attack's target defaulted to 1, but sustain is greater than 1.";

        }

      } else {

        throw "The attack parameter must be either a number or an object.";

      }

    } else if( attack < 0 ) {

      throw "Attack time cannot be a negative number.";

    }

    // At this point, attack has been validated.

    if( typeof attack === 'number' ) {

      envelope.attack = {

        time: attack,

        initial: 0,

        target:  1

      };

    } else {

      envelope.attack = attack;

      if( envelope.attack.initial === undefined ) {

        envelope.initial = 0;

      }

      if( envelope.attack.target === undefined ) {

        envelope.target = 1;

      }

    }

    // Attack curve is a linear ramp.

    if( envelope.attack.time > 1 / context.sampleRate ) {

      envelope.attack.curve = new Float32Array( context.sampleRate * envelope.attack.time );

      for( var i = 0; i < envelope.attack.curve.length; i++ ) {

        envelope.attack.curve[ i ] =

          envelope.attack.initial + i *

            ( envelope.attack.target - envelope.attack.initial ) /

              ( envelope.attack.time * context.sampleRate );

      }

    } else {

      envelope.attack.curve = false;

    }

  };

  envelope.setSustain = function( sustain ) {

    if( typeof sustain !== 'number' ) {

      throw "Sustain should be a number.";

    } else if( sustain > envelope.attack.target ) {

      throw "Sustain should be less than the envelope's attack's target.";

    } else if(

      envelope.release !== undefined &&

      envelope.release.target !== undefined &&

      sustain < envelope.release.target

    ) {

      throw "Sustain should be greater than the envelope's release target.";

    }

    // At this point, sustain has been validated.

    envelope.sustain = sustain;

  };

  envelope.setDecay = function( decay ) {

    if( typeof decay !== 'number' ) {

      throw "Decay should be a number.";

    } else if( decay < 0 ) {

      throw "Decay should be a positive number.";

    }

    // At this point, decay is validated

    envelope.decay = {

      time: decay

    };

    // Decay curve is an exponential ramp

    if( envelope.decay.time  > 1 / context.sampleRate ) {

      envelope.decay.curve = new Float32Array( envelope.decay.time * context.sampleRate );

      for( var i = 0; i < envelope.decay.curve.length; i++ ) {

        envelope.decay.curve[ i ] =

          ( envelope.attack.target - envelope.sustain + 1 ) *

            Math.exp( i * Math.log( 1 /

                ( envelope.attack.target - envelope.sustain + 1 ) ) /

                  ( envelope.decay.time * context.sampleRate ) ) +

          envelope.sustain - 1;

      }

    } else {

      envelope.decay.curve = false;

    }

  };


  envelope.setRelease = function( release ) {

    if( typeof release !== 'number' ) {

      if( typeof release === 'object' ) {

        if(

          typeof release.time !== 'number' ||

          release.time < 0

        ) {

          throw "Release should have a property 'time' that references a positive number.";

        } else if(

          release.target !== undefined &&

          envelope.sustain < release.target

        ) {

          throw "The release's target should be less than the envelope's sustain.";

        } else if(

          release.target === undefined &&

          envelope.sustain < 0

        ) {

          throw "The release target defaulted to 0, but the envelope's sustain is less than 0.";

        }

      } else {

        throw "Release must be either a number or an object.";

      }

    } else if( release < 0 ) {

      throw "Release must be a positive number";

    }

    // At this point, release has been validated.

    if( typeof release === 'number' ) {

      envelope.release = {

        time: release,

        target: 0

      };

    } else {

      envelope.release = release;

      if( envelope.release.target === undefined ) {

        envelope.release.target = 0;

      }

    }

    // Release curve is an exponential ramp.

    if( envelope.release.time > 1 / context.sampleRate ) {

      envelope.release.curve = new Float32Array( envelope.release.time * context.sampleRate );

      for( var i =0; i < envelope.release.curve.length; i++ ) {

        envelope.release.curve[ i ] =

          ( envelope.sustain - envelope.release.target + 1 ) *

            Math.exp( i * Math.log( 1 /

              ( envelope.sustain - envelope.release.target + 1 ) ) /

                ( envelope.release.time * context.sampleRate ) ) +

          envelope.release.target - 1;

      }

    } else {

      envelope.release.curve = false;

    }

  };

  try {

    envelope.setAttack( attack );

    envelope.setSustain( sustain );
    
    envelope.setDecay( decay );

    envelope.setRelease( release );

  } catch( error ) {

    console.error( error );

    return;

  }

  envelope.connect = function( destination ) {

    if( destination instanceof AudioParam ) {

      envelope.param = destination;

    } else {

      var error = "Invalid destination. ";

      error += "Envelopes should only be ";

      error += "connected to instances of AudioParam.";

      console.error( error );

    }

  };

  envelope.on = function( when, sustainTime ) {

    // Make sure that the envelope is connected

    if( !envelope.param ) {

      console.error( "Envelope is not connected to any audio param. Use envelope.connect." );

      return;

    }

    // If when is not defined, then the envelope

    // triggers immediately.

    when = when || context.currentTime;

    // If when is less than the current time,

    // then the envelope triggers immediately.

    if( when < context.currentTime ) {

      when = context.currentTime;

    }

    // Schedule attack phase.

    if( envelope.attack.curve ) {

      envelope.param.setValueCurveAtTime(

        envelope.attack.curve,

        when,

        envelope.attack.time

      );

    } else {

      envelope.param.setValueAtTime(

        envelope.attack.target,

        when

      );

    }

    // Schedule decay phase.

    if( envelope.decay.curve ) {

      envelope.param.setValueCurveAtTime(

        envelope.decay.curve,

        when + envelope.attack.time,

        envelope.decay.time

      );

    } else {

      envelope.param.setValueAtTime(

        envelope.sustain,

        when + envelope.attack.time

      );

    }

    if( sustainTime !== undefined ) {

      // In case that sustainTime is

      // specified, trigger release phase.

      envelope.off(

        when +

        envelope.attack.time +

        envelope.decay.time +

        sustainTime

      );

    }

    // If sustainTime is undefined, the envelope

    // sustains until off is scheduled otherwise.

  };

  envelope.off = function( when ) {

    // Make sure that the envelope is connected.

    if( !envelope.param ) {

      console.error( "Envelope is not connected to any audio param. Use envelope.connect" );

      return;

    }

    // If when is not defined, then the envelope

    // releases immediately.

    when = when || 0;

    // Schedule release phase.

    if( envelope.release.curve ) {

      envelope.param.setValueCurveAtTime(

        envelope.release.curve,

        when,

        envelope.release.time

      );

    } else {

      envelope.param.setValueAtTime(

        envelope.release.target,

        when

      );

    }

  };

  return envelope;

};