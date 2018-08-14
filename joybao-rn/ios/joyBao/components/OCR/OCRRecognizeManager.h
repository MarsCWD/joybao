//
//  OCRViewManager.h
//  joyBao
//
//  Created by Chen on 2017/7/13.
//  Copyright © 2017年 Facebook. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>
#import "AipOcrSdk.h"

@interface OCRRecognizeManager : NSObject <RCTBridgeModule, AipOcrDelegate>

@property (nonatomic, strong) RCTResponseSenderBlock callback;
@end
