import { ISdStargateSdkBuilder } from './ISdStargateSdkBuilder';
import { SdStargateSdkBuilder } from './SdStargateSdkBuilder';

export function createSdk(): ISdStargateSdkBuilder {
    return new SdStargateSdkBuilder();
}
