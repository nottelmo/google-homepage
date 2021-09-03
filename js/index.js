
class Accordion{
    // Smooth open/close details transition
    constructor(element){
        this.element = element;
        this.summary = element.querySelector('summary');
        this.content = element.querySelector('summary + div');
        this.animation = null;
        this.isClosing = false;
        this.isOpening = false;

        this.summary.addEventListener('click', (e) => this.onClick(e));
    }

    onClick(e){
        e.preventDefault();
        this.element.style.overflow = "hidden";

        if(this.isClosing || !this.element.open){
            this.open();
        }else if(this.isOpening || this.element.open){
            this.shrink();
        }
    }

    shrink(){
        this.isClosing = true;

        const startHeight = `${this.element.offsetHeight}px`;
        const endHeight = `${this.summary.offsetHeight}px`;

        if(this.animation){
            this.animation.cancel() ;
        }

        this.animation = this.element.animate(
            {height: [startHeight, endHeight]},
            {duration: 200, easing: 'ease-out'}
        );

        this.animation.onfinish = () => this.onAnimationFinish(false);
        this.animation.oncancel = () => this.isClosing = false;
    }

    open(){
        this.element.style.height = `${this.element.offsetHeight}px`;
        this.element.open = true;
        
        window.requestAnimationFrame(() => this.expand());
    }

    expand(){
        this.isOpening = true;

        const startHeight = `${this.element.offsetHeight}px`;
        const endHeight = `${this.summary.offsetHeight + this.content.offsetHeight}px`;

        if(this.animation){
            this.animation.cancel();
        }

        this.animation = this.element.animate(
            {height: [startHeight, endHeight]},
            {duration: 200, easing: 'ease-out'}
        );

        this.animation.onfinish = () => this.onAnimationFinish(true);
        this.animation.oncancel = () => this.isOpening = false;
    }

    onAnimationFinish(open){
        this.element.open = open;

        this.animation = null;
        this.isClosing = false;
        this.isOpening = false;

        this.element.style.height = this.element.style.overflow = '';
    }
}

class VideoTimelineSplit{
    // Generate checkpoints on video timelines
    constructor(el){
        this.el = el;
        
        // Get necessary elements
        this.totalTime = el.querySelector('.videoTotalTime').textContent;
        this.details = el.querySelector('.videoKeyMoments');
        this.keyMoments = el.querySelectorAll('.videoKeyMoment-time');
        this.timeline = el.querySelector('.videoKeyMoments-timeline');
        this.designations = el.querySelector('.videoKeyMoments-designations');
        this.checkpoints = el.querySelectorAll('.videoKeyMoments-timeline .-checkpoint');

        // Get Video total time to convert other times later
        this.totalTimeInSecs = this.timeToSecs(this.totalTime);

        // Create list of video key moments and convert them to a range of 0-100
        this.keyMomentsList = [];
        this.keyMoments.forEach((e, i) => {
            let keyMomentToSecs = this.timeToSecs(e.textContent);
            let keyMomentScaled = convertToPerc(keyMomentToSecs, this.totalTimeInSecs);
            this.keyMomentsList.push(keyMomentScaled.toFixed(2)); 
        });

        // Insert Key moments in Timeline
        this.insertCheckPoints(this.keyMomentsList)

        this.details.addEventListener(
            "click", (e) => 
            this.checkVisibleCheckpoints(this.designations, this.timeline)
        );
    }

    timeToSecs(time){
        // Convert hh:mm:ss to seconds 
        let timeSplit = time.split(":");
        let timeInSecs = (arr) => {
            if(arr.length  == 2){
                return arr[0]*60+arr[1];
            }else if(arr.length == 3){
                return arr[0]*3600+arr[1]*60+arr[2];
            }else{
                return 0;
            }
        }
        return timeInSecs(timeSplit);
    }

    insertCheckPoints(list){
        // Take list and insert div.checkpoints in timeline
        list.forEach((el) => {
            let checkpoint = document.createElement("div");
            checkpoint.classList.add("videoKeyMoments", "-checkpoint");
            checkpoint.style.marginLeft = el+"%";
            this.timeline.appendChild(checkpoint);
        });    
    }

    checkVisibleCheckpoints(div, timeline){
            // Get Total width including scroll area
            let scrollWidth = div.scrollWidth;
            // Convert Visible width to %
            let divWidthInPerc = convertToPerc(div.offsetWidth, scrollWidth);
            // Convert scroll distance from left to %
            let scrollLeftInPerc = convertToPerc(div.scrollLeft, scrollWidth);
            // Make a list of scroll left dist % + what is visible after that
            let percSeen = [
                scrollLeftInPerc.toFixed(2),
                (scrollLeftInPerc+divWidthInPerc).toFixed(2)
            ];

            //Get timeline Checkpoints
            let timelineCheckpoints = timeline.children;
                    
            for(let i = 0; i < timelineCheckpoints.length; i++){
                let checkpointMarginLeftINT = parseFloat(timelineCheckpoints[i].style.marginLeft);
                if(checkpointMarginLeftINT >= percSeen[0] && checkpointMarginLeftINT <= percSeen[1]){
                    timelineCheckpoints[i].classList.add("-visible");
                }else{
                    timelineCheckpoints[i].classList.remove("-visible");
                }
            }

            div.addEventListener("scroll", function(){
                // Update variables
                scrollLeftInPerc = convertToPerc(div.scrollLeft, scrollWidth);
                percSeen = [
                    scrollLeftInPerc.toFixed(2),
                    (scrollLeftInPerc+divWidthInPerc).toFixed(2)
                ];

                // Iterate Variables Again
                for(let i = 0; i < timelineCheckpoints.length; i++){
                    let checkpointMarginLeftINT = parseFloat(timelineCheckpoints[i].style.marginLeft);
                    if(checkpointMarginLeftINT >= percSeen[0] && checkpointMarginLeftINT <= percSeen[1]){
                        timelineCheckpoints[i].classList.add("-visible");
                    }else{
                        timelineCheckpoints[i].classList.remove("-visible");
                    }
                }
            });
        }
}

function convertToPerc(num, max){
    // Convert any number to % from value and max value
    let numInPerc = (num*100) / max;
    return numInPerc;
}

// Add Accordion behaviour to details
document.querySelectorAll('details').forEach((element) => {
    new Accordion(element);
})

// Generate timeline checkpoints from marked times
document.querySelectorAll('.videoPreview').forEach((element) => {
    if(element.querySelector('.videoKeyMoments')){
        new VideoTimelineSplit(element);
    }
});

// Add/remove nav shadow according to scroll position
window.addEventListener("scroll", (e) => {
    const nav = document.querySelector("nav");
    if(window.pageYOffset > 100){
        nav.classList.add("nav-shadow");
    }else{
        nav.classList.remove("nav-shadow");
    }
});
