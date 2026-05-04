class UpwardCompressorProcessor extends AudioWorkletProcessor {
    constructor(){
        super();

        this.prevPd = 0;
    }

    static get parameterDescriptors() {
        return [
            {
                name: "attack",
                defaultValue: 0.003,
                minValue: 0,
                maxValue: 1,
                automationRate: "k-rate",
            },
            {
                name: "release",
                defaultValue: 0.250,
                minValue: 0,
                maxValue: 1,
                automationRate: "k-rate",
            },
            {
                name: "knee",
                defaultValue: 0,
                minValue: 0,
                maxValue: 40,
                automationRate: "k-rate",
            },
            {
                name: "ratio",
                defaultValue: 12,
                automationRate: "k-rate",
            },
            {
                name: "threshold",
                defaultValue: -24,
                minValue: -100,
                maxValue: 0,
                automationRate: "k-rate",
            },
        ];
    }

    process(inputs, outputs, parameters){
        const input = inputs[0];
        const output = outputs[0];
        const attack = parameters.attack[0];
        const release = parameters.release[0];
        const knee = parameters.knee[0];
        const ratio = parameters.ratio[0];
        const threshold = parameters.threshold[0];
        const alphaA = this.envAlpha(attack/1000);
        const alphaR = this.envAlpha(release/1000);

        for (let channel = 0; channel < input.length; channel++){
            const inputChannel = input[channel];
            const outputChannel = output[channel];
            for (let i = 0; i < inputChannel.length; i++) {
                const currSample = this.lin2Db(inputChannel[i]);
                
                //gain computer
                let gcOut;
                if (2 * (currSample - threshold) < -1 * knee){ //sample = -50 -> -20 < -5 
                    gcOut = threshold - (currSample - threshold) / ratio; //
                }
                else if (Math.abs(2 * (currSample - threshold)) <= knee){
                    gcOut = currSample - (1/ratio - 1) * Math.pow((currSample - threshold - knee/2), 2) / (2 * knee);
                }
                else {
                    gcOut = currSample;
                }

                //peak detector
                const toPd = currSample - gcOut;
                let outSample;
                if (toPd > this.prevPd){
                    outSample = alphaA * this.prevPd + (1 - alphaA) * toPd;
                }
                else {
                    outSample = alphaR * this.prevPd + (1 - alphaR) * toPd;
                }
                this.prevPd = outSample;

                const outGain = this.db2Lin(outSample);
                outputChannel[i] = inputChannel[i] * outGain;
            }
        };
        return true;
    }

    lin2Db(linVal){
        return 20 * Math.log10(Math.max(Math.abs(linVal), 1e-5));
    }
    db2Lin(dbVal){
        return Math.pow(10, (dbVal/20));
    }
    envAlpha(s){
        return Math.exp(-1/(s*0.001*sampleRate)); 
    }
}

registerProcessor("upward-compressor-processor", UpwardCompressorProcessor);