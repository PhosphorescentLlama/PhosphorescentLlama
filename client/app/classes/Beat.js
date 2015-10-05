var Beat = function( soundID, sequence ) {

  this._generator = window.context._generators[ soundID ];

  this._sequence = sequence;

  this._isOn = false;

};

Beat.prototype.toggle = function( ) {

  this._isOn = !this._isOn;

};

Beat.prototype.isOn = function( ) {

  return this._isOn;

};

Beat.prototype.play = function( when ) {

  // when is the time at which we want the

  // beat's sample to trigger. This time is

  // given in seconds relative to the context's

  // coordinate system ( that is, relative to

  // context.currentTime ).

  // For instance, beat.play( 23.456 ) will

  // play the beat's sample when context.currentTime

  // is equal to 23 seconds with 456 milliseconds, that is

  // , when 23 seconds and 456 milliseconds have passed

  // since the audio context was initialized.

  // If when is less than the current time, the sample

  // will play immediately.

  this._generator.connect( this._sequence._track );

  this._generator.start( when );

};