

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
            return this.elementDetails.reduce( (acc, [selector, kind]) => {
                const kindList = acc[kind] || []
                acc[kind] = [
                    ...kindList, 
                    ...document.querySelectorAll(selector)
                ]
                return acc
            }, {})    
        }

        get allElements () {
            return Object.values(this.elementsByKind).flat()
        }

        initialize() {
            // Delete any existing instances
            console.log('UniversalKeyboardNavigator initialized')

            console.log('allElements', this.allElements)
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