const { createApp } = Vue;
const hnue = createApp({
    data() {
        return {
            tabnow: null,
            tabs: {
                "top": "topstories",
                "new": "newstories",
                "best": "beststories",
                "show": "showstories",
                "ask": "askstories"
            },
            // tabs: {
            //     "top": {"url": "topstories", "current": false},
            //     "new": {"url": "newstories", "current": false},
            //     "best": {"url": "beststories", "current": false},
            //     "show": {"url": "showstories", "current": false},
            //     "ask": {"url": "askstories", "current": false}
            // }
        }
    },
    // computed: {
    //     tabCurrent(key) {
    //         return this.tabs[key].current;
    //     }
    // },
    methods: {
        // tabCurrent(key) {
        //     // console.warn(this.tabnow);
        //     // console.warn(this.tabnow === key);
        //     // return this.tabnow === key;
        // },
        tabCurrent(key) {
            // return this.tabs[key].current ? 'page': null;
            return this.tabnow === key ? 'page' : null;
        },
        tabRoute(tab) {
            return `/${tab}`;
        }
    },
    mounted() {
        // if (!this.$route.params.tab) {
        //     console.log(this.$route.params.tab);
        //     this.tabnow = 'top'; // Works initially but then jammed on!! Why?!!
        //     console.log(this.tabnow)
        // }
    }
});

hnue.component('hn-posts', {
    data() {
        return {
            // post: {
            //     "by" : "dhouston",
            //     "descendants" : 71,
            //     "id" : 8863,
            //     "kids" : [ 8952, 9224, 8917, 8884, 8887, 8943, 8869, 8958, 9005, 9671, 8940, 9067, 8908, 9055, 8865, 8881, 8872, 8873, 8955, 10403, 8903, 8928, 9125, 8998, 8901, 8902, 8907, 8894, 8878, 8870, 8980, 8934, 8876 ],
            //     "score" : 111,
            //     "time" : 1175714200,
            //     "title" : "My YC app: Dropbox - Throw away your USB drive",
            //     "type" : "story",
            //     "url" : "http://www.getdropbox.com/u/2/screencast.html"
            // },
            items: [],
            allitems: [],
            // pageitems: [],
            pagelimit: 25,
            pagenumber: 0,
            // pagestart: 0,
            // pageend: 0
        }
    },
    template: `
        <ol v-if="allitems" :start="pagestart + 1">
            <li v-for="item in paginate">
                <hn-story :which="item" :key="item">Sorry, nothing here</hn-story>
            </li>
        </ol>
        <p v-else>Sorry, no posts to display&hellip;</p>
        <nav>
            <ul class="nav nav--buttons">
                <li><a v-if="pagestart" class="button" href="#" @click="pagePrev">Previous</a></li>
                <li><a v-if="pageend" class="button" href="#" @click="pageNext">Next</a></li>
            </ul>
        </nav>
        <p class="center">Page {{ pagenumber + 1 }}</p>
    `,
    created() {
        this.$watch(
            () => this.$route.params, (toParams, previousParams) => {
                console.warn(this.tabby());
                //(1)
                // if ( this.hasTab(this.tabby()) ) {// Check tab exists as option

                //     this.fetchy(this.tabby()); // Fetch tabs data

                //     if (toParams.tab !== previousParams.tab) {
                //         this.pagenumber = 0; // Reset pagaintion page
                //     }
                //     this.$root.tabnow = this.tabby(); // Set tabnow in data to affect tabs aria-current

                // } else {
                //     console.error('Tab does not exist!!');
                // }
                //(2) Call newTab() method...
                if (toParams.tab !== previousParams.tab) {
                    this.pagenumber = 0; // Reset pagaintion page
                }
                this.newTab(); // fetch tab data
            })
    },
    mounted() {
        console.log(`component mounted`);
        // console.log(fetchy());
        // this.fetchy();
        // console.log(this.post);
        // this.allitems();
        // console.log(this.allitems);
        // fetch('https://hacker-news.firebaseio.com/v0/topstories.json').then(res => res.json()).then((response) => {
        //     this.allitems = response;
        //     // this.pageitems = this.paginate();
        //     // this.paginate();
        // }).catch(err => console.error(err));
        // Grab default fetch...
        // this.fetchy('top');
        //(1)Grab the tab route and pass to fetch...
        // if (this.tabby()) {
        //     this.fetchy(this.tabby);
        //     this.$root.tabnow = this.tabby();
        // } else {
        //     console.log('top (default)');
        //     this.fetchy('top');
        //     this.$root.tabnow = 'top';
        // }
        //(2)
        this.newTab();
    },
    methods: {
        // fetchy() {
        //    this.post = fetch('https://hacker-news.firebaseio.com/v0/item/34690900.json').then(res => res.json()).catch(err => console.error(err));
        // }
        // paginate() {
        //     let start = this.pagelimit * this.pagenumber;
        //     let end = this.pagelimit * (this.pagenumber + 1);
        //     console.warn(this.allitems.slice(start, end));
        //     return this.allitems.slice(start, end);
        // }
        // Grabs a slice of posts from allitems the size of the pagelimit...
        // paginate() {
        //     console.warn(this.allitems.slice(this.pagestart, this.pageend));
        //     // return this.allitems.slice(this.pagestart, this.pageend);
        //     // this.allitems = this.allitems.slice(this.pagestart, this.pageend);// This just disappears the array. Gone!
        //     // this.pageitems = this.allitems.slice(this.pagestart, this.pageend);// Not working right because something about slice() making a copy and not updating array even though it does [https://vuejs.org/guide/essentials/list.html#array-change-detection]
        //     this.pageitems = this.allitems.slice(this.pagestart, this.pageend);
        //     console.warn(this.pageitems);
        // },
        // NEW Work out if theres any pages left...
        paginateTotal() {
            return (this.pagelimit * this.pagenumber) < this.allitems.length;
        },
        pagePrev() {
            this.pagenumber--;
            // this.paginate();
        },
        pageNext() {
            this.pagenumber++;
            // this.paginate();
        },
        // Get tab var and fetch respective tab data...
        fetchy(tabname) {
            console.log('fetchy!!')
            // if (tabname && this.hasTab(tabname)) {
            let whichdata = this.$root.tabs[tabname] ? this.$root.tabs[tabname] : 'topstories';
            // let whichdata = this.$root.tabs[tabname].url ?? this.$root.tabs['top'].url;
            let tabdata = new URL(`https://hacker-news.firebaseio.com/v0/${encodeURIComponent(whichdata)}.json`);
            if (!tabdata) return;
            fetch(tabdata).then(res => res.json()).then((response) => {
                this.allitems = response; // Lazy way for now, should cache each array in seperate array for later...
                // this[tabname] = response;
            }).catch(err => console.error(err));
            // } else {
            //     console.error('Tab does not exist!');
            // }
        },
        // Grab route param...
        tabby() {
            console.warn(this.$route.params.tab);
            return this.$route.params.tab;
        },
        //Check tab is in tabs object. Router has a guard that can act as this too!!
        hasTab(tab) {
            // console.warn(Object.hasOwn(this.$root.tabs, tab));
            // let alltabs = this.$root.tabs;
            // return alltabs.hasOwnProperty(tab);
            return Object.hasOwn(this.$root.tabs, tab); // Newer, not very compatible...
        },
        newTab() {
            console.log('pooooooooooooo');
            console.log(this.tabby());
            console.log(this.hasTab(this.tabby()));
            if (this.hasTab(this.tabby())) {
                console.warn('Tabby');
                this.fetchy(this.tabby());
                this.$root.tabnow = this.tabby();
            } else {
                console.warn('No tabby');
                this.fetchy('top');
                this.$root.tabnow = 'top';
            }
        }
    },
    computed: {
        // Paginate moved to here!! NOPE still dont work... FFS https://vuejs.org/guide/essentials/list.html#displaying-filtered-sorted-results
        paginate() {
            console.warn(this.allitems.slice(this.pagestart, this.pageend));
            console.warn(this.allitems);
            return this.allitems.slice(this.pagestart, this.pageend);
        },
        pagestart() {
            return this.pagelimit * this.pagenumber;
        },
        pageend() {
            return this.pagelimit * (this.pagenumber + 1);
        }
    }
})

hnue.component('hn-story', {
    props: ['which'],
    data() {
        return {
            story: {}
        }
    },
    template: `
        <article class="post" id="story.id" :key="story.id" :class="story.type">

            <router-link v-if="!ispostroute && singlelink" :to="singlelink"><h1>{{ story.title }}</h1></router-link>
            <h1 v-else><a :href="story.url" target="_blank">{{ story.title }}</a></h1>

            <p v-if="ispostroute && domain" class="lowlight lowlight--domain">{{ domain }}</p>

            <div v-if="ispostroute && !story.deleted && !!postsnippet" v-html="story.text"></div>

            <ul class="post-footer lowlight">
                <li v-if="!ispostroute"><span class="sr">Posted:</span>{{ timeago }}</li>
                <li v-else><span class="sr">Posted:</span><time :datetime="posteddatetime">{{ posted }}</time></li>
                <li v-if="ispostroute"><span class="sr">Submitted:</span> {{ story.by }}</li>
                <li v-if="story.descendants"><a :href="commentslinks">{{ story.descendants }}</a> comments</li>
            </ul>

        </article>
            
        <nav v-if="isstory">
            <router-link v-if="isstory && !tabback" class="button" to="/">Back to homepage</router-link>
            <router-link v-if="isstory && tabback !== null" class="button" :to="tabback">Back to {{ tabback }}</router-link>
        </nav>

        <aside v-if="ispostroute">
            <h2 id="comments" v-if="story.type ==='story'">Comments</h2>
            <hn-comments ref="comments" :ids="story.kids" aria-labelledby="comments"></hn-comments>
        </aside>

        <p v-if="isstory"><a href="#top">Back to top</a></p>
    `,
    computed: {
        postsnippet: function () {
            // return new String(this.story.text).slice(0, 300);
            // return new String(this.story.text).slice(0, 300)//.replace(/(<([^>]+)>)/gi, "");//[https://css-tricks.com/snippets/javascript/strip-html-tags-in-javascript/]
            return new String(this.textpurified).slice(0, 300);
        },
        posted: function () {
            // return new Date(this.story.time*1000);
            const options = { "dateStyle": "medium", "timeStyle": "short" };
            return new Date(this.story.time * 1000).toLocaleString('en', options);
        },
        posteddatetime: function () {
            return new Date(this.story.time * 1000); // this is not correct!! toISOString is not working tho
        },
        // postedrelative: function() {
        //     const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" }); //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/RelativeTimeFormat/format
        //     return rtf.format(new Date(this.story.time*1000), "hour"); // This needs something to work out most suitable unit: hours, days, year... relative datetime attribute also
        // },
        singlelink: function () {
            return `/post/${encodeURI(this.story.id)}`; // Purely for router-link
        },
        commentslinks() {
            // return `https://news.ycombinator.com/item?id=${this.story.id}#comments`;
            return `/post/${encodeURI(this.story.id)}/#comments`;
        },
        ispostroute() {
            return this.$route.params.which;
        },
        isstory() {
            return this.ispostroute && this.story.type === 'story';
        },
        // textSanitised() {
        //     let sanitizer = new Sanitizer();
        //     let testy = `<p>No HTML!</p>`;
        //     return sanitizer.sanitizeFor("div", testy); //[https://developer.mozilla.org/en-US/docs/Web/API/HTML_Sanitizer_API#browser_compatibility]
        // },
        textpurified() {
            return this.story.text;
            // return DOMPurify.sanitize(this.story.text);
        },
        timeago() {
            // Stas Parshin [https://stackoverflow.com/a/69122877]
            const date = new Date(this.story.time * 1000);
            const formatter = new Intl.RelativeTimeFormat('en');
            const ranges = {
                years: 3600 * 24 * 365,
                months: 3600 * 24 * 30,
                weeks: 3600 * 24 * 7,
                days: 3600 * 24,
                hours: 3600,
                minutes: 60,
                seconds: 1
            };
            const secondsElapsed = (date.getTime() - Date.now()) / 1000;
            for (let key in ranges) {
                if (ranges[key] < Math.abs(secondsElapsed)) {
                    const delta = secondsElapsed / ranges[key];
                    return formatter.format(Math.round(delta), key);
                }
            }
        },
        skipparent() {
            if (this.story.parent) { return '/#' + encodeURI(this.story.parent) };
        },
        domain() {
            if (this.story.url){
                try {
                    return new URL(this.story.url).host;
                } catch (err) {
                    console.error(err);
                    return this.story.url;
                }
            }
        },
        tabback() {
            return this.$root.tabnow ? '/' + this.$root.tabnow : null;
        }
    },
    methods: {
        focuscomments() {
            // Something that queries the URL #comments :target and focues the commments
            console.log(this.$route.hash);
            if (this.$route.hash === '#comments') {
                console.log('#Comments hash');
                this.$refs.comments.focus();
            }
        }
    },
    mounted() {
        let fetchthis = encodeURI(`https://hacker-news.firebaseio.com/v0/item/${this.which}.json`);
        fetch(fetchthis).then(res => res.json()).then((response) => {
            this.story = response;
        }).catch(err => console.error(err));
        // if (this.focuscomments()) {
        //     this.$refs.comments.focus();
        // }
        // this.focuscomments();
        if (this.$route.hash === '#comments') {
            console.log('#Comments hash');
            // this.$refs.comments.focus();
        }
    }
});

// Pass in the kids value from the story component and this fetches for each story...
hnue.component('hn-comments', {
    props: ['ids'],
    template: `
        <ul class="comments" v-if="ids">
            <li v-for="id in ids"><hn-story :which="id" :key="id">Sorry, nothing here.</hn-story></li>
        </ul>
    `
});

const Homeposts = `
<hn-posts></hn-posts>
`;

const Singlepost = `
<hn-story></hn-story>
`;

// VUE ROUTER
// 1. Define route components.
// These can be imported from other files
const Home = { template: Homeposts }
const Single = { template: Singlepost }

// 2. Define some routes
// Each route should map to a component.
// We'll talk about nested routes later.
const routes = [
    { path: '/:pathMatch(.*)*', component: `<p>Sorry not found.</p><router-link to="/"></router-link>` },
    { path: '/', component: Home },
    // { path: '/:tab', component: Home }, // NEW! Pass tab to posts component
    {
        path: '/:tab',
        component: Home,
        beforeEnter: (to, from) => {
            // Check TO param exists in list of acceptable tabs!! Cant get to this.tabs, this.$root.tabs, hnue.tabs nothing works...
            //   if ( Object.hasOwn(this.$root.tabs, to) ) {
            //     return false // reject the navigation
            //   }
            if (!['top', 'new', 'best', 'ask', 'show'].includes(to.params.tab)) {
                console.warn('Router guard denied!!')
                return false
            }
        }
    },
    { path: '/post/:which', component: Single, props: true },
]

// 3. Create the router instance and pass the `routes` option
// You can pass in additional options here, but let's
// keep it simple for now.
const router = VueRouter.createRouter({
    // 4. Provide the history implementation to use. We are using the hash history for simplicity here.
    history: VueRouter.createWebHashHistory(),
    routes, // short for `routes: routes`
})

hnue.use(router);
hnue.mount('#app')
