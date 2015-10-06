app.controller( 'GameController' , [ '$scope', 'playerSequencer', 'httpFactory', 'initialize', '$rootScope', '$timeout', function ( $scope, playerSequencer, httpFactory, initialize, $rootScope, $timeout ) {

  /////////////////
  //
  //
  // SETTINGS
  //
  //
  /////////////////

  if ( $rootScope.user ) {

    $scope.level = $rootScope.user.level;

  } else {

    $scope.level = 1;

  }

  /////////////////
  //
  //
  // FUNCTIONS
  //
  //
  /////////////////

  $scope.startLevel = function ( ) {

    $scope.getSequencer( );

  };

  $scope.getSequencer = function ( ) {

    httpFactory.getSequencer( $scope.level, function ( data ) {

      $scope.$broadcast( 'createTargetSequencer', data );

      $scope.lastLevel = +data.headers( 'lastLevel' );

    });

  };

  $scope.playerSequencerPlayToggle = function ( ) {

    $scope.$broadcast( 'playToggle' );

  };

  $scope.submit = function ( ) {

    $scope.playerSequencer.stop( );

    $scope.targetSequencer.stop( );

    if ( $scope.playerSequencer.match( $scope.targetSequencer ) ) {

      $scope.playerWonLevel( );

    } else {

      $scope.failedMatch( );

    }

  };

  $scope.declareWrong = function ( ) {

    $scope.wrong = true;

    $timeout( function() { $scope.wrong = false; }, 300 );

  };

  $scope.playerWonLevel = function ( ) {

    if( $scope.level !== $scope.lastLevel ) {

      $scope.$emit( 'correctMatch' );

    }


    if( $scope.level === $scope.lastLevel ) {

      $scope.playerWonGame( );

    } else {

      $scope.level++;

      if( $rootScope.user ) {

        $rootScope.user.level = $scope.level;

        httpFactory.updateLevel( $rootScope.user );

      }


      $scope.startLevel( );

    }

  };

  $scope.playerWonGame = function( ) {

    if( $rootScope.user ) {

      $rootScope.user.level = $scope.level;

      httpFactory.updateLevel( $rootScope.user );

    }

    $scope.$emit( 'playerWon' );

  };

  $scope.failedMatch = function ( ) {

    $scope.$emit( 'notAMatch' );

  };

  /////////////////
  //
  //
  // EVENT HANDLERS
  //
  //
  /////////////////

  $scope.$on( 'madeTargetSequencer', function ( event, targetSequencer ) {

    $scope.targetSequencer = targetSequencer;

    $scope.$broadcast( 'playTwice' );

    $scope.$broadcast( 'createPlayerSequencer', $scope.targetSequencer );

  });

  $scope.$on( 'madePlayerSequencer', function ( event, playerSequencer ) {

    $scope.playerSequencer = playerSequencer;

  });

  //makes playing sequencers mutually exclusive
  $scope.$on( 'targetSequencerPlaying', function ( ) {

    $scope.$broadcast( 'playerStopPlaying' );

  });

  //makes playing sequencers mutually exclusive
  $scope.$on( 'playerSequencerPlaying', function ( ) {

    $scope.$broadcast( 'targetStopPlaying' );

  });

  $scope.$on( 'submitMatch', function ( ) {

    $scope.submit( );

  });

  ////////////////////
  //
  //
  // INITIALIZATION
  //
  //
  ////////////////////

  initialize( $scope.startLevel );


  //BELOW HERE ARE ALL TEMPORARY FUNCTIONS THAT WON'T BE NEEDED ONCE WE ARE RETRIEVING SOUNDS PROPERLY
  $scope.buildLevel = function ( ) {

    var levelSettings = levelFactory[ $scope.level ];

    var levelSequencer = new Sequencer (

      levelSettings.tempo,

      levelSettings.tickNumber,

      levelSettings.soundIDs

    );

    for( var i = 0; i < levelSettings.beatsToToggle.length; i++ ) {

      var sequenceIndex = levelSettings.beatsToToggle[ i ][ 0 ];

      var beatIndex = levelSettings.beatsToToggle[ i ][ 1 ];

      levelSequencer.toggleBeat( sequenceIndex, beatIndex );

    }

    var savedSequencer = levelSequencer.save( );

    httpFactory.postSequencer( $scope.level, savedSequencer, $scope.getSequencer );

  };

  $scope.saveToDatabase = function( ) {

    var savedSequencer = $scope.playerSequencer.save( );

    httpFactory.postSequencer( $scope.inputLevel, savedSequencer, function( response ) {

      if ( response ) {

        $scope.inputLevel = '';

      }

    });

  };

  $scope.createSequencer = function( ) {

    var soundIDs = $scope.inputSounds.split( ',' );

    var userSequencer = playerSequencer.build( $scope.inputTempo, $scope.inputBeats, soundIDs );

    $scope.$broadcast( 'createPlayerSequencer', userSequencer );

    $scope.inputTempo = '';

    $scope.inputBeats = '';

    $scope.inputSounds = '';

  };

}]);
