

;(function (){
    class UniversalKeyboardNavigator {
        constructor ( options = {} ) {
            const {
                selectors = {}
            } = options

        }


        isDescendantOf (element, tagNames) {
            if (typeof element.closest === 'function') {
              return tagNames.some(name => element.closest(name) !== null)
            }

            return false
        }

        isContentinfo (element) {
            if (element.tagName.toLowerCase() !== 'footer') return true
            if (!this.isDescendantOf(element, ['article', 'section'])) return true

            return false
        }

        isBanner (element) {
            if (element.tagName.toLowerCase() !== 'header') return true
            if (!this.isDescendantOf(element, ['article', 'section'])) return true

            return false
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