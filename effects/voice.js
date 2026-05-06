export default class Voice{
    constructor(audioContext,  frequency, destination){
        this.audioContext = audioContext;

        this.oscillator = this.audioContext.createOscillator();
        this.gainNode = this.audioContext.createGain();

        this.oscillator.connect(this.gainNode);
        this.gainNode.connect(destination);

        this.oscillator.type = "square";
        this.oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);

        this.gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    }

    start(){
        const startTime = this.audioContext.currentTime;
        const attackTime = 0.01;

        this.oscillator.start(startTime);
        this.gainNode.gain.linearRampToValueAtTime(1, startTime + attackTime);
    }

    stop(){
        const stopTime = this.audioContext.currentTime;
        const releaseTime = 1.5;

        this.gainNode.gain.cancelScheduledValues(stopTime);
        this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, stopTime);
        this.gainNode.gain.exponentialRampToValueAtTime(0.001, stopTime + releaseTime);

        this.oscillator.stop(stopTime + releaseTime);
    }
}