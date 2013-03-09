
var  item_sku = [6250719846,9739369984,7327289124,9461139478,13483264708,9567008743,8792570700,15074652608,15548524760,14488119094];
var t = [12486302944,17883760731,17103160725,21083452181,7159737917,10816125427,14180220421,18448736992,16738908532,14738967160,14293625503,9387891204,16705556250,
16476524878,10854276487,14393972734,10472109165,12647292018,12213936879,15154390743,14708479467];
//,9461139478,13483264708,9567008743,8792570700,15074652608,15548524760,14488119094,12486302944,17883760731,17103160725,14341732370,7159737917,10816125427,8602282779,18448736992,16738908532,14738967160,14293625503,9387891204,16705556250,
//16476524878,10854276487,14393972734,10472109165,12647292018,12213936879,15154390743,14708479467];
//,4376186709,3208752038,13032324442];
var item_sku = [6250719846];
for(var ii=0;ii<item_sku.length;ii++){
    UT.open("http://item.taobao.com/item.htm?id="+item_sku[ii], function () {
        describe("物流信息", function() {
            //先定义物流区域的节点
            delivery = $("ul.tb-meta span:contains('物流运费')").parent();
            //根据ip可以指定校验收货地址默认是浙江杭州
            region = delivery.children().find("#J_CurrentRegionName");
            //运费模板数据
            delivery_fee = delivery.children().find("#J_Carriage");
            /*物流共分三种情况：包邮、有运费模板、无运费模板的普通运费
  其中包邮和运费模板都多了目的地这个元素，可以通过此元素与普通运费分开
  其中包邮的和运费模板的具体运费节点的结构也有所不同，卖家包邮无span节点，运费模板至少有1个span节点
*/
            //判断物流地址模板为空另外的方法：(delivery_fee.attr("data-url"));
            if(region.length == 1 && (delivery_fee.children().length > 0)){
                it('运费模板', function() {
                    expect(region).toHaveText("浙江杭州");
                    expect(delivery_fee.html()).toContain("¥");
                    //切换地址后
                    runs(function() {
                        simulate(region,"click");
                    });
                    waitsMatchers(function(){
                        expect("#J_RegionDialog").toHaveCSS("display","block");
                    });
                    runs(function() {
                        simulate("#J_RegionProvinces .tb-clearfix>li a:contains('直辖市')","mouseover")
                    });
                    waitsMatchers(function(){
                        expect("#J_RegionProvinces li:eq(0) a").toHaveAttr("class","tb-selected");
                    });

                    runs(function() {
                        simulate("#J_RegionCities .tb-clearfix>li a:contains('北京')","click")
                    });
                    waitsMatchers(function(){
                        //校验切换地址后的结果
                        expect(region).toHaveText("北京");
                        expect(delivery_fee.html()).toContain("¥");
                    });
                });
            }
            else if(region.length == 1 && delivery_fee.children().length == 0){
                it('包邮', function() {
                    expect(region).toHaveText("浙江杭州");
                    expect(delivery_fee.html()).toContain("卖家承担运费");
                    //切换地址后
                    runs(function() {
                        simulate(region,"click");
                    });
                    waitsMatchers(function(){
                        expect("#J_RegionDialog").toHaveCSS("display","block");
                    });
                    runs(function() {
                        simulate("#J_RegionProvinces .tb-clearfix>li a:contains('直辖市')","mouseover")
                    });
                    waitsMatchers(function(){
                        expect("#J_RegionProvinces li:eq(0) a").toHaveAttr("class","tb-selected");
                    });

                    runs(function() {
                        simulate("#J_RegionCities .tb-clearfix>li a:contains('北京')","click")
                    });
                    waitsMatchers(function(){
                        //校验切换地址后的结果
                        expect(region.html()).toContain("北京");
                        expect(delivery_fee.html()).toContain("卖家承担运费");
                    });
                });
            }
            else if(region.length == 0){
                it('普通运费', function() {
                    //alert("3");
                    expect(delivery_fee.html()).not.toContain("卖家承担运费");
                    expect(delivery_fee.html()).toContain("¥");
                });
            }
            else {
                it('其他情况', function() {
                    expect("1").toBe("2");
                });
            }
        });
    });
}