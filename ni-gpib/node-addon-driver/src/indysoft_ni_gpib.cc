#include <napi.h>
#include <ni4882.h>
#include <stdlib.h>
#include <stdio.h>

using namespace Napi;

Napi::String GetIdentity(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  int deviceUnitDescriptor = ibdev(0, 2, 0, T1s, 1, 0);
  if (deviceUnitDescriptor <= 0) {
    ibonl(deviceUnitDescriptor, 0);
    Napi::Error::New(env, "No device with address 2 was listening").ThrowAsJavaScriptException();
    return Napi::String::New(env, "No device with address 2 was listening");
  }
  ibwrt(deviceUnitDescriptor, "*IDN?\n", 6);
  char identity[254];
  ibrd(deviceUnitDescriptor, identity, 20);
  return Napi::String::New(env, identity);
}

Napi::Object Init(Napi::Env env, Napi::Object exports) {
  exports.Set(Napi::String::New(env, "IndysoftNiGpib"),
              Napi::Function::New(env, GetIdentity));
  return exports;
}

NODE_API_MODULE(addon, Init)
