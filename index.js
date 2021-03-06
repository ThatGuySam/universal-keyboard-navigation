
// All code runs in this function
;(function (){
    class UniversalKeyboardNavigator {

        // Pulls options from the window context
        constructor ( options = {} ) {
            const {
                landmarkSelectors = [],
                headingSelectors = [],
                linkSelectors = [],
                excludeSelectors = [],
            } = options

            this.landmarkSelectors = landmarkSelectors
            this.headingSelectors = headingSelectors
            this.linkSelectors = linkSelectors

            this.excludeSelectorsArray = excludeSelectors || []
            this.excludeSelector = this.excludeSelectorsArray.join(', ')


            this.lastFocusedClass = 'ukbn-last-focused'

            // 'end' or 'start'
            this.direction = options.direction || 'end'

            this.keydownListenerActive = false
        }

        // https://www.w3.org/TR/2017/NOTE-wai-aria-practices-1.1-20171214/examples/landmarks/HTML5.html
        // Based on https://github.com/a11y-tools/visua11y/blob/e1d0dc5aea72b58a0567212f42fb736e5728e11e/content-scripts/visua11y.js#L1888
        elementDetails = [
            // Landmarks

            // complementary
            [
                'aside:not([role]), [role~="complementary"], [role~="COMPLEMENTARY"]',
                'landmark'
            ], 

            // contentinfo
            [
                `${ this.contentInfoOrBannerSelector } footer, [role~="contentinfo"], [role~="CONTENTINFO"]`, 
                'landmark'
            ], 
            
            // application
            [
                '[role~="application"], [role~="APPLICATION"]', 
                'landmark'
            ],

            // navigation
            [
                'nav, [role~="navigation"], [role~="NAVIGATION"]',
                'landmark'
            ],

            // region aria-labelledby
            [
                '[role~="region"][aria-labelledby], [role~="REGION"][aria-labelledby]', 
                'landmark'
            ], 

            // region aria-label
            [
                '[role~="region"][aria-label], [role~="REGION"][aria-label]', 
                'landmark'
            ], 

            // region section
            [
                'section[aria-labelledby], section[aria-label]', 
                'landmark'
            ], 

            // banner
            [
                `${ this.contentInfoOrBannerSelector } header, [role~="banner"], [role~="BANNER"]`, 
                'landmark'
            ],

            // search
            [
                '[role~="search"], [role~="SEARCH"]', 
                'landmark'
            ], 

            // main
            [
                'main, [role~="main"], [role~="MAIN"]',
                'landmark'
            ], 


            // Headings
            [
                'h1, h2, h3, h4, h5, h6, [role~="heading"], [role~="HEADING"]',
                'heading'
            ], 

            // Links
            [
                'a, [role~="link"], [role~="LINK"]',
                'link', 
            ]
        ]



        contentInfoOrBannerExceptions = [ 'article', 'aside', 'main', 'nav', 'section' ]
        contentInfoOrBannerSelector = this.notSelectors( this.contentInfoOrBannerExceptions ).join('')

        notSelectors ( selectors ) {
            return selectors.map( selector => `:not(${selector})` )
        }

        get hasExcludes () {
            return this.excludeSelectorsArray.length > 0
        }

        isExcluded ( element ) {
            if ( !this.hasExcludes ) return false

            return element.matches( this.excludeSelector )
        }

        get elementsByKind () {
            // We'll use a Set for each kind
            // so that element can exist in multiple kinds but not twice in the same kind
            // Example might be nav that's a link for mobile
            // Set - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set
            const byKind = {
                landmark: new Set(),
                heading: new Set(),
                link: new Set(),
            }

            const selectorToElements = selector => [...document.querySelectorAll(selector)]

            const addElementsToSet = (selectors, kind) => {
                const elements = selectors.map( selectorToElements ).flat()

                for (const element of elements) {
                    // Skip elements that are excluded
                    if( this.isExcluded( element ) ) {
                        console.log('Element matches excludedSelector', element)
                        continue
                    }

                    // Skip elements that we've already added
                    if ( byKind[kind].has(element) ) {
                        console.log('Element already exists in set', element)
                        continue
                    }

                    byKind[kind].add(element)
                }
            }

            // Add elements from options argument
            addElementsToSet( this.landmarkSelectors, 'landmark' )
            addElementsToSet( this.headingSelectors, 'heading' )
            addElementsToSet( this.linkSelectors, 'link' )

            // Add elements from elementDetails
            for (const [selector, kind] of this.elementDetails) {
                addElementsToSet( [selector], kind )
            }

            // Convert Sets to Arrays
            for (const kind in byKind) {
                byKind[kind] = Array.from( byKind[kind] ).sort( this.byElementVisualOrder )
            }

            return byKind
        }

        get allElements () {
            // console.log('allElements', this.elementsByKind)

            // Put all elements into a Set to remove duplicates
            const allElementsSet = new Set( Object.values(this.elementsByKind).flat() )

            // Sort by visual order
            return Array.from( allElementsSet ).sort( this.byElementVisualOrder )
        }

        get lastFocusedElement () {
            return document.querySelector(`.${ this.lastFocusedClass }`)
        }

        byElementVisualOrder ( a, b ) {
            if( a === b ) return 0
            if( !a.compareDocumentPosition) {
                // support for IE8 and below
                return a.sourceIndex - b.sourceIndex
            }
            if( a.compareDocumentPosition(b) & 2) {
                // b comes before a
                return 1
            }
            return -1
        }

        getWrappingIndex ( index, elements ) {
            const wrappingIndex = index + elements.length
            return wrappingIndex % elements.length
        }


        findNextElement ( kind ) {

            const kindList = this.elementsByKind[kind]
            
            // Get last focused element
            // or start from the beginning
            const lastFocusedElement = this.lastFocusedElement

            if ( !lastFocusedElement ) {
                console.log('No last focused element')
                return kindList[0]
            }

            const lastFocusedIndex = this.elementsByKind[ kind ].indexOf( lastFocusedElement )

            console.log( 'lastFocusedIndex', lastFocusedIndex, lastFocusedElement )

            let nextIndex = ({
                'end': lastFocusedIndex + 1,
                'start': lastFocusedIndex - 1,
            })[ this.direction ]

            // Wrap around to the beginning or end
            nextIndex = this.getWrappingIndex( nextIndex, kindList )

            console.log('nextIndex', nextIndex)

            const nextElement = kindList[nextIndex]

            return nextElement
        }

        focusElement ( element ) {
            // Find and existing focused elements
            const focusedElements = document.querySelectorAll(`.${ this.lastFocusedClass }`)

            // Add focused class to element
            element.classList.add( this.lastFocusedClass )

            // Scroll to element
            element.scrollIntoView({
                block: 'center',
                inline: 'center',
            })

            // Set focus on element
            element.focus()

            // Remove focused class from all other elements
            for (const focusedElement of focusedElements) {
                focusedElement.classList.remove( this.lastFocusedClass )
            }
        }

        focusNextElement ( kind ) {
            const nextElement = this.findNextElement( kind )

            console.log('nextElement', nextElement)

            this.focusElement( nextElement )
        }

        // https://www.toptal.com/developers/keycode
        keyCodes = {
            // h
            '72': {
                method: () => this.focusNextElement( 'heading' ),
            },
            // l
            '76': {
                method:  () => this.focusNextElement( 'link' )
            },
            // m
            '77': {
                method: () => this.focusNextElement( 'landmark' )
            },
            // Up Arrow
            '38': {
                method: () => this.direction = 'start',
            },
            // Down Arrow
            '40': {
                method: () => this.direction = 'end',
            }
        }

        isElement ( element ) {
            return element instanceof Element || element instanceof HTMLDocument;  
        }

        isInputableElement ( element ) {
            if ( !this.isElement( element ) ) return false

            return element.matches( 'input, textarea, select' )
        }

        pauseKeydownListenerUntilBlur () {
            console.log('Pausing listener')
            this.keydownListenerActive = false
            document.removeEventListener('keydown', this.handleKeyDown)

            // Start a new listener for blur
            document.activeElement.addEventListener('blur', () => {
                this.startKeydownListener()
            }, { once: true })
        }

        startKeydownListener () {
            // Prevent keydown listener from starting multiple times
            if ( this.keydownListenerActive ) return

            console.log('Starting listener')

            this.keydownListenerActive = true
            document.addEventListener('keydown', this.handleKeyDown)
        }

        handleKeyDown = ( event ) => {
            // console.log('document.activeElement', document.activeElement)

            // If we're on an inputable element somehow
            // pause our listener so we don't slow down typing
            if ( this.isInputableElement( document.activeElement ) ) {
                this.pauseKeydownListenerUntilBlur()
                return
            }

            const { keyCode } = event

            // Do nothing if key is not a navigation key
            if( !Object.keys(this.keyCodes).includes( String(keyCode) ) ) return

            event.preventDefault()

            this.keyCodes[ keyCode ].method( event )
        }


        addStyles () {
            const primaryColor = '#020202'
            const secondaryColor = '#f1f1f1'

            const styles = /* html */`
                <style>
                    .${ this.lastFocusedClass } {
                        background-color: ${ secondaryColor } !important; 
                        color: ${ primaryColor } !important;
                        border: solid 2px white !important;
                        outline: 4px solid black !important;
                    }

                    .${ this.lastFocusedClass } * {
                        color: inherit !important;
                    }
                </style>
            `
            document.head.insertAdjacentHTML( 'beforeend', styles )
        }

        initialize () {
            this.addStyles()

            // Delete any existing instances
            console.log('UniversalKeyboardNavigator initialized')

            // console.log('allElements', this.allElements )
            // console.log( 'elementsByKind', this.elementsByKind )
            

            // Pause listener for Input elements
            // so we don't slow down typing
            window.addEventListener('focus', focusEvent => {
                if ( this.isInputableElement( focusEvent.target ) ) {
                    this.pauseKeydownListenerUntilBlur()
                }
            })

            // Start keydown listener
            this.startKeydownListener()
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