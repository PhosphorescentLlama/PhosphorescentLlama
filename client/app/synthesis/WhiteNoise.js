window.AudioContext.prototype.createWhiteNoise = function( ) {

  var whiteNoise = {};

  whiteNoise.sampleRate = this.sampleRate;

  whiteNoise.duration = 10; // seconds

  whiteNoise.length = whiteNoise.duration * whiteNoise.sampleRate;

  whiteNoise.buffer = this.createBuffer( 1, whiteNoise.length, whiteNoise.sampleRate );

  whiteNoise.output = null;

  whiteNoise.source = null;

  var channel = whiteNoise.buffer.getChannelData( 0 );

  for( var i = 0; i < whiteNoise.length; i++ ) {

    channel[ i ] = 2 * Math.random( ) - 1;

  }

  // methods

  var context = this;

  whiteNoise.connect = function( destination ) {

    if( destination.hasOwnProperty( 'input' ) ) {

      whiteNoise.output = destination.input;

    } else {

      whiteNoise.output = destination;

    }

  };

  whiteNoise.start = function( when ) {

    // Only start the white noise if it hasn't

    // been started before or if it has been stopped

    // after the last time it was started.

    if( whiteNoise.source === null ) {

      whiteNoise.source = context.createBufferSource( );

      whiteNoise.source.buffer = whiteNoise.buffer;

      whiteNoise.source.connect( whiteNoise.output );

      whiteNoise.source.loop = true;

      whiteNoise.source.start( when );

    }

  };

  whiteNoise.stop = function( when ) {

    // Only stop the white noise if it has already

    // been started.

    if( whiteNoise.source !== null ) {

      whiteNoise.source.stop( when );

      whiteNoise.source = null;

    }

  };

  return whiteNoise;

};