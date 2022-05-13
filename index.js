

;(function (){
    class UniversalKeyboardNavigator {
        constructor ( options = {} ) {
            const {
                selectors = {}
            } = options


        }

        initialize() {
            // Delete any existing instances
            console.log('UniversalKeyboardNavigator initialized')
        }
    }

    // Create and Initialize the keyboard navigator
    window.universalKeyboardNavigator = new UniversalKeyboardNavigator()
    window.universalKeyboardNavigator.initialize()

})()