import cliProgress from 'cli-progress';

//https://snyk.io/advisor/npm-package/cli-progress/example
export default class ProgressBar{
    constructor(name, size = 25, type = 'rect'){
        this.progressBar = new cliProgress.SingleBar({
            format: `${name} |{bar}| {value}/{total} {percentage}% {duration_formatted}`,
            barsize: size,
            hideCursor: true,
            stopOnComplete: true
        }, type === 'rect' ? cliProgress.Presets.rect : type === 'legacy' ? cliProgress.Presets.legacy : cliProgress.Presets.shades_classic);
    }

    start(totalValue, startValue = 0){
        this.progressBar.start(totalValue, startValue);
    }

    update(value){
        this.progressBar.update(value);
    }

    stop(){
        this.progressBar.stop();
        console.log('');
    }
}