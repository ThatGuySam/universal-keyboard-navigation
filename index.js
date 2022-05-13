

;(function (){
    class UniversalKeyboardNavigator {

        // Pulls options from the window context
        constructor ( options = {} ) {
            const {
                landmarkSelectors = [],
                headingSelectors = [],
                linkSelectors = [],
            } = options

        }


        contentInfoOrBannerExceptions = [ 'article', 'aside', 'main', 'nav', 'section' ]

        isDescendantOf (element, tagNames) {
            if (typeof element.closest === 'function') {
              return tagNames.some(name => element.closest(name) !== null)
            }

            return false
        }

        isContentinfo (element) {
            if (element.tagName.toLowerCase() !== 'footer') return true
            if (!this.isDescendantOf(element, contentInfoOrBannerExceptions )) return true

            return false
        }

        isBanner (element) {
            if (element.tagName.toLowerCase() !== 'header') return true
            if (!this.isDescendantOf(element, contentInfoOrBannerExceptions )) return true

            return false
        }

        initialize() {
            // Delete any existing instances
            console.log('UniversalKeyboardNavigator initialized')
        }
    }

    // Get any options from window
    // Example: 
    // <script>window.UniversalKeyboardNavigatorOptions = { landmarkSelectors: ['header', 'footer'] }</script>
    const options = window.UniversalKeyboardNavigatorOptions || {}

    // Create and Initialize the keyboard navigator
    window.universalKeyboardNavigator = new UniversalKeyboardNavigator( options )
    window.universalKeyboardNavigator.initialize()

})()