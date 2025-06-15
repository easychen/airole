你正在设计一个包含多个事件的[主题]故事，请规划[数量]个具有代表性事件，供用户体验。

JSON 的 schema 如下：

{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["id", "meta", "events"],
  "properties": {
    "id": {
      "type": "string",
      "description": "事件书唯一标识符，使用UUID格式"
    },
    "meta": {
      "type": "object",
      "required": ["name", "desp"],
      "properties": {
        "name": {
          "type": "string",
          "description": "事件书名称"
        },
        "author": {
          "type": "string",
          "description": "作者名称（可选）"
        },
        "author_link": {
          "type": "string",
          "description": "作者链接，可以是网址或邮箱地址（以http://、https://或mailto:开头）"
        },
        "desp": {
          "type": "string",
          "description": "事件书详细描述"
        }
      }
    },
    "events": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["id", "number", "title", "desp", "unlockType", "completeType"],
        "properties": {
          "id": {
            "type": "string",
            "description": "事件唯一标识符，使用UUID格式"
          },
          "number": {
            "type": "integer",
            "description": "事件编号，通常是10的倍数"
          },
          "title": {
            "type": "string",
            "description": "事件标题"
          },
          "desp": {
            "type": "string",
            "description": "事件详细描述"
          },
          "unlockType": {
            "type": "string",
            "enum": ["none", "events"],
            "description": "解锁类型，可选值: 'none'(无需解锁), 'events'(其他事件完成后)"
          },
          "unlockCondition": {
            "description": "解锁条件，内容根据unlockType有不同的结构",
            "oneOf": [
              {
                "type": "string",
                "description": "当unlockType为'none'时，可为空字符串"
              },
              {
                "type": "string",
                "description": "当unlockType为'events'时，是JSON字符串表示的事件ID数组"
              }
            ]
          },
          "completeType": {
            "type": "string",
            "enum": ["none", "status", "prompt"],
            "description": "完成类型，可选值: 'none'(手动完成), 'status'(状态值条件), 'prompt'(提示词识别)"
          },
          "compeletCondition": {
            "description": "完成条件，内容根据completeType有不同的结构",
            "oneOf": [
              {
                "type": "string",
                "description": "当completeType为'none'时，可为空字符串"
              },
              {
                "type": "string",
                "description": "当completeType为'status'时，是JSON字符串表示的状态条件对象数组"
              },
              {
                "type": "string",
                "description": "当completeType为'prompt'时，是提示词字符串"
              }
            ]
          }
        }
      }
    }
  }
}

当completeType为'status'时，compeletCondition字段包含的状态条件对象数组的schema如下：

{
  "type": "array",
  "items": {
    "type": "object",
    "required": ["key", "op"],
    "properties": {
      "key": {
        "type": "string",
        "description": "状态键名"
      },
      "op": {
        "type": "string",
        "enum": ["eq", "neq", "gt", "lt", "gte", "lte", "contains", "notcontains", "empty", "notempty"],
        "description": "操作符"
      },
      "value": {
        "description": "比较值，除了'empty'和'notempty'操作符外都需要"
      }
    }
  }
}

输出示例：

{
    "id": "a9d937aa-cde1-49b8-9fba-6bdc188cccc8",
    "meta": {
        "name": "恋爱循环",
        "author": "Gemini",
        "author_link": "",
        "desp": "一系列恋爱事件"
    },
    "events": [
        {
            "id": "c76675f9-d332-4f37-9a27-f3c08c8c2b57",
            "number": 10,
            "title": "相遇",
            "desp": "在学校门口的斜坡上， 遇到了正在奋力奔跑的 ，一个意外让他们撞到了一起，在一系列的互动后，两人留下了对方的联系方式。",
            "unlockType": "none",
            "unlockCondition": "",
            "completeType": "none",
            "compeletCondition": ""
        }
    ]
}

编号按10递增。id 随机。新的事件补充到 events 里边。在desp中，使用  代指用户， 代指角色。