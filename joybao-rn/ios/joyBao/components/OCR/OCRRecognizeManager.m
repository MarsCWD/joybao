//
//  OCRViewManager.m
//  joyBao
//
//  Created by Chen on 2017/7/13.
//  Copyright © 2017年 Facebook. All rights reserved.
//

#import "OCRRecognizeManager.h"

@implementation OCRRecognizeManager

RCT_EXPORT_MODULE()

RCT_EXPORT_METHOD(justAlert:(NSInteger)alertContent callback:(RCTResponseSenderBlock)callback)
{
  callback(@[@(alertContent)]);
}

RCT_EXPORT_METHOD(showOCRViewWithType:(NSInteger)cardType callback:(RCTResponseSenderBlock)callback)
{
  self.callback = callback;
  
  [[AipOcrService shardService] authWithAK:@"rn7jg1eBoSd5381WWdGbDxU1"
                                     andSK:@"ymFrZTBjcyI4B7VGXLVLPmVpmXxHQwnp"];
  
  UIViewController * vc = [AipCaptureCardVC ViewControllerWithCardType:cardType andDelegate:self];
  UIViewController *root = [UIApplication sharedApplication].delegate.window.rootViewController;
  while(root.presentedViewController != nil) {
    root = root.presentedViewController;
  }
  
  [root presentViewController:vc animated:YES completion:nil];
}

#pragma mark - AipOcrDelegate
- (void)ocrOnIdCardSuccessful:(id)result {
//  NSString *title = nil;
  NSMutableString *message = [NSMutableString string];
  
  if(result[@"words_result"]){
    [result[@"words_result"] enumerateKeysAndObjectsUsingBlock:^(id key, id obj, BOOL *stop) {
      [message appendFormat:@"%@: %@", key, obj[@"words"]];
    }];
  }
  
  if (self.callback) {
    self.callback(@[message.copy]);
  }
  
//  [[NSOperationQueue mainQueue] addOperationWithBlock:^{
//    UIAlertView *alertView = [[UIAlertView alloc] initWithTitle:title message:[NSString stringWithFormat:@"%@", message] delegate:self cancelButtonTitle:@"确定" otherButtonTitles:nil];
//    [alertView show];
//  }];
}

- (void)ocrOnBankCardSuccessful:(id)result {
  NSString *title = nil;
  NSMutableString *message = [NSMutableString string];
  title = @"银行卡信息";
  //    [message appendFormat:@"%@", result[@"result"]];
  [message appendFormat:@"卡号：%@\n", result[@"result"][@"bank_card_number"]];
  [message appendFormat:@"类型：%@\n", result[@"result"][@"bank_card_type"]];
  [message appendFormat:@"发卡行：%@\n", result[@"result"][@"bank_name"]];
  
  [[NSOperationQueue mainQueue] addOperationWithBlock:^{
    UIAlertView *alertView = [[UIAlertView alloc] initWithTitle:title message:message delegate:self cancelButtonTitle:@"确定" otherButtonTitles:nil];
    [alertView show];
  }];
}

- (void)ocrOnGeneralSuccessful:(id)result {
  NSMutableString *message = [NSMutableString string];
  if(result[@"words_result"]){
    for(NSDictionary *obj in result[@"words_result"]){
      [message appendFormat:@"%@", obj[@"words"]];
    }
  }else{
    [message appendFormat:@"%@", result];
  }
  
  [[NSOperationQueue mainQueue] addOperationWithBlock:^{
    [[[UIAlertView alloc] initWithTitle:@"识别结果" message:message delegate:self cancelButtonTitle:@"确定" otherButtonTitles:nil] show];
  }];
  
}

- (void)ocrOnFail:(NSError *)error {
  NSString *msg = [NSString stringWithFormat:@"%li:%@", (long)[error code], [error localizedDescription]];
  [[NSOperationQueue mainQueue] addOperationWithBlock:^{
    [[[UIAlertView alloc] initWithTitle:@"识别失败" message:msg delegate:self cancelButtonTitle:@"确定" otherButtonTitles:nil] show];
  }];
}


@end
