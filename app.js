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
        }
    },
    methods: {
        tabCurrent(key) {
            return this.tabnow === key ? 'page' : null;
        },
        tabRoute(tab) {
            return `/${tab}`;
        }
    }
});

hnue.component('hn-posts', {
    data() {
        return {
            items: [],
            allitems: [],
            pagelimit: 25,
            pagenumber: 0
        }
    },
    template: `
        <ol class="posts" v-if="allitems" :start="pagestart + 1">
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
                if (Object.keys(toParams).length) {
                    if (toParams.tab !== previousParams.tab) {
                        this.pagenumber = 0; // Reset pagination page
                        this.newTab(); // fetch tab data
                    }
                }
            })
    },
    mounted() {
        this.newTab();
    },
    methods: {
        paginateTotal() {
            return (this.pagelimit * this.pagenumber) < this.allitems.length;
        },
        pagePrev() {
            this.pagenumber--;
        },
        pageNext() {
            this.pagenumber++;
        },
        // Get tab var and fetch respective tab data...
        fetchy(tabname) {
            let whichdata = this.$root.tabs[tabname] ? this.$root.tabs[tabname] : 'topstories';
            let tabdata = new URL(`https://hacker-news.firebaseio.com/v0/${encodeURIComponent(whichdata)}.json`);
            if (!tabdata) return;
            fetch(tabdata).then(res => res.json()).then((response) => {
                this.allitems = response; 
            }).catch(err => console.error(err));
        },
        // Grab route param...
        tabby() {
            console.warn(this.$route.params.tab);
            return this.$route.params.tab;
        },
        //Check tab is in tabs object. Router has a guard that can act as this too!!
        hasTab(tab) {
            return Object.hasOwn(this.$root.tabs, tab);
        },
        newTab() {
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

            <p v-if="ispostroute && domain" class="lowlight">{{ domain }}</p>

            <div v-if="ispostroute && !story.deleted && !!postsnippet" v-html="textpurified"></div>

            <hn-storyfooter :posteddate="story.time" :postedby="story.by" :comments="story.descendants"></hn-storyfooter>
    
            <nav v-if="isstory">
                <router-link v-if="isstory && !tabback" class="button" to="/">Back to homepage</router-link>
                <router-link v-if="isstory && tabback !== null" class="button" :to="tabback">Back to {{ tabback }}</router-link>
                <a v-if="hnlink" :href="hnlink" target="_blank">View on Hacker News</a>
            </nav>

            <hn-comments :ids="story.kids" :type="story.type"  v-if="ispostroute"></hn-comments>
            
        </article>
    `,
    computed: {
        textpurified() {
            return DOMPurify.sanitize(this.story.text);
        },
        postsnippet: function () {
            return new String(this.textpurified).slice(0, 300);
        },
        singlelink: function () {
            return `/post/${encodeURI(this.story.id)}`;
        },
        commentslinks() {
            return `/post/${encodeURI(this.story.id)}/#comments`;
        },
        ispostroute() {
            return this.$route.params.which;
        },
        isstory() {
            return this.ispostroute && this.story.type === 'story';
        },        
        skipparent() {
            if (this.story.parent) { return '/#' + encodeURI(this.story.parent) };
        },
        domain() {
            if (this.story.url) {
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
        },
        hnlink() {
            return `https://news.ycombinator.com/item?id=${encodeURIComponent(this.story.id)}`;
        }
    },
    methods: {
        focuscomments() {
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
        if (this.$route.hash === '#comments') {
            console.log('#Comments hash');
        }
    }
});

hnue.component('hn-storyfooter', {
    props: ['posteddate', 'postedby', 'comments'],
    template: `
    <section>
        <ul class="post-footer lowlight">
            <li v-if="!ispostroute"><span class="sr">Posted:</span>{{ timeago }}</li>
            <li v-else><span class="sr">Posted:</span><time :datetime="posteddatetime">{{ posted }}</time></li>
            <li v-if="ispostroute"><span class="sr">Submitted:</span> {{ postedby }}</li>
            <li v-if="comments"><a>{{ comments }}</a> comments</li>
        </ul>
    </section>
    `,
    computed: {
        ispostroute() {
            return this.$route.params.which;
        },
        userlang() {
            return window.navigator.languages ? window.navigator.languages : window.navigator.language;
        },
        posted: function () {
            if (!this.posteddate) return;
            try {
                const lang = this.userlang;
                const options = { "dateStyle": "medium", "timeStyle": "short" };
                return new Date(this.posteddate * 1000).toLocaleString(lang, options);
            } catch(err) {
                console.error(err);
                return this.posteddate ?? null;
            }
        },
        timeago() {
            // Stas Parshin [https://stackoverflow.com/a/69122877]
            const lang = this.userlang;
            const date = new Date(this.posteddate * 1000);
            const formatter = new Intl.RelativeTimeFormat(lang);
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
        posteddatetime: function () {
            return this.posteddate ? new Date(new Date(this.posteddate * 1000)).toISOString() : null;
        }
    }
});

hnue.component('hn-comments', {
    props: {
        'ids': Array, 
        'type': String
    },
    data() {
        return {
            collapsed: false
        }
    },
    template: `
    <section v-if="ids">
        <h2 id="comments" v-if="type ==='story'">Comments</h2>
        <button class="button" type="button" v-if="type ==='comment' && hasComments" @click="collapseThread" :aria-controls="controlsId" :aria-expanded="!collapsed"><span v-if="!collapsed">Collapse</span><span v-else>Expand</span> {{ threadLength }}</button>
        <ul :id="controlsId" class="comments" :hidden="collapsed">
            <li v-for="id in ids">
                <hn-story :which="id" :key="id">Sorry, nothing here.</hn-story>
            </li>
        </ul>
    </section>
    `,
    computed: {
        hasComments() {
            if (this.ids) {
                return this.ids.length > 1;
            }
        },
        threadLength() {
            return `(${this.ids.length})`;
        },
        controlsId() {
            return this.ids.join('').substring(0, 8);
        }
    },
    methods: {
        collapseThread() {
            if (this.collapsed === false) {
                this.collapsed = true;
            } else {
                this.collapsed = false;
            }
        }
    }
});

const Homeposts = `
<hn-posts></hn-posts>
`;

const Singlepost = `
<hn-story></hn-story>
`;

// VUE ROUTER
const Home = { template: Homeposts }
const Single = { template: Singlepost }
const routes = [
    { path: '/:pathMatch(.*)*', component: `<p>Sorry not found.</p><router-link to="/"></router-link>` },
    { path: '/', component: Home },
    {
        path: '/:tab',
        component: Home,
        beforeEnter: (to, from) => {
            if (!['top', 'new', 'best', 'ask', 'show'].includes(to.params.tab)) {
                console.warn('Router guard denied!!')
                return false
            }
        }
    },
    { path: '/post/:which', component: Single, props: true },
]
const router = VueRouter.createRouter({
    history: VueRouter.createWebHashHistory(),
    routes, // short for `routes: routes`
})

hnue.use(router);
hnue.mount('#app')
