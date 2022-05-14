

;(function (){
    class UniversalKeyboardNavigator {

        // Pulls options from the window context
        constructor ( options = {} ) {
            const {
                landmarkSelectors = [],
                headingSelectors = [],
                linkSelectors = [],
            } = options

            this.landmarkSelectors = landmarkSelectors
            this.headingSelectors = headingSelectors
            this.linkSelectors = linkSelectors

            this.lastFocusedClass = 'ukbn-last-focused'

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
                    if (byKind[kind].has(element)) {
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
            return Object.values(this.elementsByKind).flat()
        }

        get allElementsByVisualOrder () {
            return this.allElements.sort( (a, b) => {
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
            })
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

        // https://www.toptal.com/developers/keycode
        keyCodes = {
            // h
            '72': {
                method: console.log
            },
            // l
            '76': {
                method: console.log
            },
            // m
            '77': {
                method: console.log
            },
            '38': {
                method: console.log
            },
            '40': {
                method: console.log
            }
        }

        handleKeyDown = ( event ) => {
            const { keyCode } = event

            // Do nothing if key is not a navigation key
            if( !Object.keys(this.keyCodes).includes( String(keyCode) ) ) return

            event.preventDefault()

            this.keyCodes[ keyCode ].method( event )
        }

        initialize() {
            // Delete any existing instances
            console.log('UniversalKeyboardNavigator initialized')

            console.log('allElementsByVisualOrder', this.allElementsByVisualOrder)

            // Start key listeners
            document.addEventListener('keydown', this.handleKeyDown)
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