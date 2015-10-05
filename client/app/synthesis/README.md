Synthesis
=========

AudioContext.prototype.createEnvelope
-------------------------------------

This constructor extends the browser's AudioContext class
in order to instatiate attack-decay-sustain-release envelopes
with connect, on, and off methods. The connect method
can be expected to work just as the connect method
of AudioNode. On and off method are similar to the AudioContext's
start and stop methods with two notable exceptions: ( 1 ) On and
off can be invoked many times for the same envelope instance, and
( 2 ) On triggers the attack and decay phases and leaves the envelope
in the sustain phase until off is triggered.

### Instantiation Parameters:

#### Attack:

Attack must be either a number or an options object. If attack is a number,
it will be interpreted as the attack time in seconds. In this case, the
attack ramp will be a linear ramp from 0 to 1, which is suitable for most
gain envelope applications. If attack is an options object, it must
have a property 'time' and can optionally include 'target' and 'initial'
properties. In this case, the attack ramp will be a linear ramp from 'initial'
value to 'target' value in 'time' seconds. If 'target' is not specified, it
defaults to 1. If 'initial' is not specified, it defaults to 0.

#### Decay:

Decay must be a number. This number specifies the decay time in seconds.
The decay ramp will be an exponential ramp from the attack phase's target
to the sustain phase's value in the specified number of seconds.

#### Sustain:

Sustain must be a number. This number specifies the sustain phase's value and
must be less than or equal to the attack phase's target value. After the attack
and decay phases, the envelope will output the sustain value until the off method
triggers the release phase.

#### Release:

Release must be either a number or an options object. If release is a number,
it will be interpreted as the release time in seconds. In this case, the
release ramp will be an exponential ramp from the sustain phase's value
to 0 in the specified time, which is suitable for most gain envelope applications.
If the release is an options object, it must has a property 'time' and can
optionally include a 'target' property. In this cae, the release ramp will be
an exponential ramp from the sustain phase's value to the 'target' value
in 'time' seconds. If target is not specified, it will default to 0. Note
that the release phase's target must be less than the sustain phase's value.

#### Example Gain Envelope:

    var context = new AudioContext( );

    var envelope = context.createEnvelope(

      1, // Attack Time

      1, // Decay Time

      0.5, // Sustain Value

      1, // Release Time

    );

    /*

    Now envelope is something like this:

        /\
       /  \
      /    \________ ... ____
     /                       \
    /                         \

    Except that the decay and release ramp are supposed to be exponential.

    */

#### Example Frequency Envelope:

    var context = new AudioContext( );

    var envelope = context.createEnvelope(

      { // Attack Options

        time: 1,

        target: 880,

        initial: 440

      },

      1, // Decay Time

      660, // Sustain Value

      { // Release Options

        time: 1,

        target: 440

      }

    );

### Envelope Methods:

For the explanations below, suppose the 'envelope'
with a lowercase 'e' refers to the return value of
a call to AudioContext.prototype.createEnvelope.

#### envelope.connect:

##### Invocation Parameters:

###### Destination:

Destination is the audio param that the envelope will modulate.

##### Behavior:

envelope.connect establishes which instance of Audio Param the envelope
will modulate. Note that envelope.connect must be invoked before
envelope.on or envelope.off.

#### envelope.on:

##### Invocation Parameters:

###### When:

Determines the time at which the attack phase of the envelope
will begin.

###### Sustain Time:

If defined, sustain time determines the time between the end
of the decay phase and the beginning of the release phase. If
not defined, the sustain phase will persist until envelope.off
is invoked.

##### Behavior:

envelope.on schedules the attack, decay, and sustain phases of
the envelope. In the case that sustain time is also specified,
envelope.on also schedules envelope.off after the attack time,
decay time, and sustain time have elapsed.

#### envelope.off:

##### Invocation Parameters:

###### When:

Determines the time at which the release phase of the envelope
will begin.

##### Behavior:

envelope.off schedules the release of the envelope.

### Example:

    var context = new AudioContext( );

    var osc = context.createOscillator( );

    osc.type = 'sine';

    osc.frequency.value = 60; // A

    var gain = context.createGain( );

    gain.gain.value = 0;

    gain.connect( context.destination );

    osc.connect( gain );

    var gainEnvelope = context.createEnvelope(

      1, // attack

      2, // decay

      0.5, // sustain

      1 // release

    );

    var frequencyEnvelope = context.createEnvelope(

      {

        time: 1,

        target: 880,

        initial: 440

      },

      2,

      660,

      {

        time: 1,

        target: 440

      }

    );

    gainEnvelope.connect( gain.gain );

    frequencyEnvelope.connect( osc.frequency );

    osc.start( context.currentTime );

    gainEnvelope.on( context.currentTime, 1 );

    frequencyEnvelope.on( context.currentTime, 1 );

AudioContext.prototype.createWhiteNoise:
----------------------------------------

This constructor extends the browser's AudioContext class
in order to instatiate a white noise source. The start
and stop methods behave just as the start and stop methods
of Audio Oscillators with the exception that the start and
stop methods of the white noise instance can be triggered
more than once. 

### White Noise Methods:

For the explanations below, suppose the 'whiteNoise'
with a lowercase 'w' refers to the return value of
a call to AudioContext.prototype.createWhiteNoise.

#### whiteNoise.connect:

##### Instantiation Parameters:

###### Destination:

Destination must be an Audio Node, an Audio Param,
or an instance of a class with an input property that
is either an Audio Node or an Audio Param.

###### Behavior:

If the destination is an audio node or an audio parameter,
the, whiteNoise.output is set to reference that audio node
or that audio parameter. If, instead, the destination is
an object with an input property that is an audio
node or an audio param, whiteNoise.output is set to reference
that input property.

#### whiteNoise.start:

##### Instantiation Parameters:

###### When:

Determines the time at which the whiteNoise will
be scheduled to start.

##### Behavior:

Sets whiteNoise to output white noise for an indeterminate
amount of time.

#### whiteNoise.stop:

##### Instantiation Parameters:

###### When:

Determines the time at which the whiteNoise will be
scheduled to stop.

##### Behavior:

If start has been invoked before stop is invoked, the output
of white noise will be stopped.

### Example:

    var context = new AudioContext( );

    var whiteNoise = context.createWhiteNoise( );

    var gain = context.createGain( );

    gain.gain.value = 0;

    var gainEnvelope = context.createEnvelope(

      1, // attack
      1, // decay
      0.5, // sustain
      1 // release

    );

    gainEnvelope.connect( gain.gain );

    whiteNoise.connect( gain );

    gain.connect( context.destination );

    whiteNoise.start( context.currentTime );

    gainEnvelope.on( context.currentTime, 1);

AudioContext.prototype.createKick
---------------------------------

This constructor extends the browser's AudioContext class
in order to instatiate a kick source. The start method
behaves like the start method of Audio Source Nodes except
that it can be invoked several times for the same kick instance.

### Instantiation Parameters:

#### midiNote:

midiNote can be any integer between 0 and 127. It specifies
the MIDI standard value for the root note of the kick. If midiNote
is not defined, then it defaults to 36.

### Kick Methods:

For the explanations below, suppose the 'kick'
with a lowercase 'k' refers to the return value of
a call to AudioContext.prototype.createKick.

#### kick.connect:

##### Instantiation Parameters:

###### Destination:

Destination is either an Audio Node or an
object with an input property that is an audio node.

##### Behavior:

If the destination is an Audio Node, then the
output of the kick is piped to that Audio Node.
If the destination is an object with an 'input'
property that is an Audio Node, then the output
of the kick is piped to the Audio Node at that
input property.

#### kick.start:

##### Instantiation Parameters:

###### When:

When is the time at which the kick will
be scheduled to start.

###### Behavior:

Schedules the kick to start at the time
determined by 'When'.

AudioContext.prototype.createClap
---------------------------------

This constructor extends the browser's AudioContext class
in order to instatiate a clap source. The start method
behaves like the start method of Audio Source Nodes except
that it can be invoked several times for the same clap instance.

### clap Methods:

For the explanations below, suppose the 'clap'
with a lowercase 'c' refers to the return value of
a call to AudioContext.prototype.createClap.

#### clap.connect:

##### Instantiation Parameters:

###### Destination:

Destination is either an Audio Node or an
object with an input property that is an audio node.

##### Behavior:

If the destination is an Audio Node, then the
output of the clap is piped to that Audio Node.
If the destination is an object with an 'input'
property that is an Audio Node, then the output
of the clap is piped to the Audio Node at that
input property.

#### clap.start:

##### Instantiation Parameters:

###### When:

When is the time at which the clap will
be scheduled to start.

###### Behavior:

Schedules the clap to start at the time
determined by 'When'.

AudioContext.prototype.createClosedHat
--------------------------------------

This constructor extends the browser's AudioContext class
in order to instatiate a closed hat source. The start method
behaves like the start method of Audio Source Nodes except
that it can be invoked several times for the same closed hat instance.

### closedHat Methods:

For the explanations below, suppose the 'closedHat'
with a lowercase 'c' refers to the return value of
a call to AudioContext.prototype.createClosedHat.

#### closedHat.connect:

##### Instantiation Parameters:

###### Destination:

Destination is either an Audio Node or an
object with an input property that is an audio node.

##### Behavior:

If the destination is an Audio Node, then the
output of the closed hat is piped to that Audio Node.
If the destination is an object with an 'input'
property that is an Audio Node, then the output
of the closed hat is piped to the Audio Node at that
input property.

#### closedHat.start:

##### Instantiation Parameters:

###### When:

When is the time at which the closed hat will
be scheduled to start.

###### Behavior:

Schedules the closed hat to start at the time
determined by 'When'.

AudioContext.prototype.createOpenHat
--------------------------------------

This constructor extends the browser's AudioContext class
in order to instatiate a open hat source. The start method
behaves like the start method of Audio Source Nodes except
that it can be invoked several times for the same open hat instance.

### Open Hat Methods:

For the explanations below, suppose the 'openHat'
with a lowercase 'o' refers to the return value of
a call to AudioContext.prototype.createOpenHat.

#### openHat.connect:

##### Instantiation Parameters:

###### Destination:

Destination is either an Audio Node or an
object with an input property that is an audio node.

##### Behavior:

If the destination is an Audio Node, then the
output of the open hat is piped to that Audio Node.
If the destination is an object with an 'input'
property that is an Audio Node, then the output
of the open hat is piped to the Audio Node at that
input property.

#### openHat.start:

##### Instantiation Parameters:

###### When:

When is the time at which the open hat will
be scheduled to start.

###### Behavior:

Schedules the open hat to start at the time
determined by 'When'.

AudioContext.prototype.createBass
---------------------------------

This constructor extends the browser's AudioContext class
in order to instatiate a bass source. The start method
behaves like the start method of Audio Source Nodes except
that it can be invoked several times for the same bass instance.

### Instantiation Parameters:

#### midiNote:

midiNote can be any integer between 0 and 127. It specifies
the MIDI standard value for the root note of the bass. If midiNote
is not defined, then it defaults to 36.

### Bass Methods:

For the explanations below, suppose the 'bass'
with a lowercase 'b' refers to the return value of
a call to AudioContext.prototype.createBass.

#### bass.connect:

##### Instantiation Parameters:

###### Destination:

Destination is either an Audio Node or an
object with an input property that is an audio node.

##### Behavior:

If the destination is an Audio Node, then the
output of the bass is piped to that Audio Node.
If the destination is an object with an 'input'
property that is an Audio Node, then the output
of the bass is piped to the Audio Node at that
input property.

#### bass.start:

##### Instantiation Parameters:

###### When:

When is the time at which the bass will
be scheduled to start.

###### Behavior:

Schedules the bass to start at the time
determined by 'When'.
