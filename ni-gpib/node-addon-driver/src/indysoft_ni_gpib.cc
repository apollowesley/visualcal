#include <napi.h>
#include <ni4882.h>
#include <stdlib.h>
#include <stdio.h>

using namespace Napi;

Napi::Number GetIdentity(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  int deviceUnitDescriptor = ibdev(0, 2, 0, T1s, 1, 0);
  if (deviceUnitDescriptor <= 0) {
    ibonl(deviceUnitDescriptor, 0);
    Napi::Error::New(env, "No device with address 2 was listening").ThrowAsJavaScriptException();
    return Napi::Number::New(env, -1);
  }
  return Napi::Number::New(env, deviceUnitDescriptor);
}

Napi::Object Init(Napi::Env env, Napi::Object exports) {
  exports.Set(Napi::String::New(env, "IndysoftNiGpib"),
              Napi::Function::New(env, GetIdentity));
  return exports;
}

NODE_API_MODULE(addon, Init)
